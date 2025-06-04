package app

import (
	"errors"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/integration"
	"github.com/reearth/reearth-cms/server/internal/adapter/publicapi"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/vektah/gqlparser/v2/gqlerror"
	"go.opentelemetry.io/contrib/instrumentation/github.com/labstack/echo/otelecho" // nolint:staticcheck
)

func initEcho(appCtx *ApplicationContext) *echo.Echo {
	if appCtx.Config == nil {
		log.Fatalf("AppContext.Config is nil")
	}

	e := echo.New()
	e.Debug = appCtx.Debug
	e.HideBanner = true
	e.HidePort = true
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)

	// basic middleware
	logger := log.NewEcho()
	e.Logger = logger
	e.Use(
		logger.AccessLogger(),
		middleware.Recover(),
		otelecho.Middleware("reearth-cms"),
	)
	origins := allowedOrigins(appCtx)
	if len(origins) > 0 {
		e.Use(
			middleware.CORSWithConfig(middleware.CORSConfig{
				AllowOrigins: origins,
			}),
		)
	}

	// GraphQL Playground without auth
	if appCtx.Debug || appCtx.Config.Dev {
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-cms", "/api/graphql"),
		))
		log.Infof("gql: GraphQL Playground is available")
	}

	usecaseMiddleware := UsecaseMiddleware(appCtx.Repos, appCtx.Gateways, appCtx.AcRepos, appCtx.AcGateways, interactor.ContainerConfig{
		SignupSecret:    appCtx.Config.SignupSecret,
		AuthSrvUIDomain: appCtx.Config.Host_Web,
	})

	// apis
	api := e.Group("/api", private)
	api.GET("/ping", Ping())
	api.GET("/health", HealthCheck(appCtx.Config, appCtx.Version, appCtx.Gateways))
	api.POST(
		"/graphql", GraphqlAPI(appCtx.Config.GraphQL, appCtx.Config.Dev),
		jwtParseMiddleware(appCtx),
		authMiddleware(appCtx),
		usecaseMiddleware,
	)
	api.POST(
		"/notify", NotifyHandler(),
		M2MAuthMiddleware(appCtx.Config),
		usecaseMiddleware,
	)
	api.POST("/signup", Signup(), usecaseMiddleware)

	publicapi.Echo(api.Group("/p", publicAPIAuthMiddleware(appCtx), usecaseMiddleware))
	integration.RegisterHandlers(api.Group(
		"",
		authMiddleware(appCtx),
		AuthRequiredMiddleware(),
		usecaseMiddleware,
		private,
	), integration.NewStrictHandler(integration.NewServer(), nil))

	serveFiles(e, appCtx)
	Web(e, appCtx.Config.WebConfig(), appCtx.Config.Web_Disabled, nil)
	return e
}

func jwtParseMiddleware(appCtx *ApplicationContext) echo.MiddlewareFunc {
	return echo.WrapMiddleware(lo.Must(
		appx.AuthMiddleware(appCtx.Config.JWTProviders(), adapter.ContextAuthInfo, true),
	))
}

func allowedOrigins(appCtx *ApplicationContext) []string {
	if appCtx == nil {
		return nil
	}
	origins := append([]string{}, appCtx.Config.Origins...)
	if appCtx.Debug {
		origins = append(origins, "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080")
	}
	return origins
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	code := http.StatusInternalServerError
	msg := "internal server error"

	var httpErr *echo.HTTPError
	if errors.As(err, &httpErr) {
		code = httpErr.Code
		if m, ok := httpErr.Message.(string); ok {
			msg = m
		} else if m, ok := httpErr.Message.(error); ok {
			msg = m.Error()
		} else {
			msg = "error"
		}
		if httpErr.Internal != nil {
			log("echo internal err: %+v", httpErr)
		}
		return code, msg
	}

	if errors.Is(err, rerror.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
		return code, msg
	}

	var rErr *rerror.E
	if errors.As(err, &rErr) {
		code = http.StatusBadRequest
		msg = rErr.Error()
		return code, msg
	}

	var gqlErr *gqlerror.Error
	if errors.As(err, &gqlErr) {
		code = http.StatusBadRequest
		msg = gqlErr.Error()
		return code, msg
	}

	return code, msg
}

func errorHandler(next func(error, echo.Context)) func(error, echo.Context) {
	return func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			c.Echo().Logger.Errorf(f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(err, c)
		}
	}
}

func private(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Response().Header().Set(echo.HeaderCacheControl, "private, no-store, no-cache, must-revalidate")
		return next(c)
	}
}
