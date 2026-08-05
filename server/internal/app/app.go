package app

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/99designs/gqlgen/graphql/playground"
	echootel "github.com/labstack/echo-opentelemetry"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/integration"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func initEcho(appCtx *ApplicationContext) *echo.Echo {
	if appCtx.Config == nil {
		log.Fatalf("AppContext.Config is nil")
	}

	e := echo.New()
	e.HTTPErrorHandler = errorHandler(echo.DefaultHTTPErrorHandler(false))
	e.IPExtractor = echo.ExtractIPFromXFFHeader()

	// basic middleware
	logger := log.New()
	e.Logger = log.NewSlogLogger(logger)
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(
		log.AccessLoggerV5(logger),
		middleware.Recover(),
		middleware.Gzip(),
		echootel.NewMiddleware("reearth-cms"),
	)

	usecaseMiddleware := UsecaseMiddleware(appCtx.Repos, appCtx.Gateways, appCtx.AcRepos, appCtx.AcGateways, interactor.ContainerConfig{
		SignupSecret:    appCtx.Config.SignupSecret,
		AuthSrvUIDomain: appCtx.Config.Host_Web,
	})

	// apis
	initApi(appCtx, e.Group("/api"), usecaseMiddleware)

	// GraphQL Playground without auth
	if appCtx.Debug || appCtx.Config.Dev {
		e.GET("/graphql", echo.WrapHandler(
			playground.Handler("reearth-cms", "/api/graphql"),
		))
		log.Infof("gql: GraphQL Playground is available")
	}

	// Public API
	initPublicApi(appCtx, e.Group("/api/p"), usecaseMiddleware)

	// Integration API
	initIntegrationApi(appCtx, e.Group("/api"), usecaseMiddleware)

	// Assets API
	initAssetsApi(appCtx, e.Group("/assets"))

	// Web app delivery
	Web(e, appCtx.Config.WebConfig(), appCtx.Config.Web_Disabled, nil)

	return e
}

func initApi(appCtx *ApplicationContext, api *echo.Group, usecaseMiddleware echo.MiddlewareFunc) {
	api.Use(private)
	api.GET("/ping", Ping())
	api.GET("/health", appCtx.HealthChecker.Handler())

	graphqlMiddlewares := []echo.MiddlewareFunc{}
	if o := allowedOrigins(appCtx); len(o) > 0 {
		graphqlMiddlewares = append(graphqlMiddlewares, middleware.CORS(o...))
	}
	graphqlMiddlewares = append(graphqlMiddlewares,
		jwtParseMiddleware(appCtx),
		authMiddleware(appCtx),
		usecaseMiddleware,
	)
	api.Any("/graphql", GraphqlAPI(appCtx.Config.GraphQL, appCtx.Config.Dev), graphqlMiddlewares...)

	api.POST("/notify", NotifyHandler(), M2MAuthMiddleware(appCtx.Config), usecaseMiddleware)

	// M2M API endpoints
	if appCtx.Config.AuthM2M.Token != "" {
		m2mGroup := api.Group("/m2m")
		m2mGroup.Use(
			M2MTokenAuthMiddleware(appCtx.Config.AuthM2M.Token),
			usecaseMiddleware,
		)
		m2mGroup.GET("/assets/:uuid/is-private", M2MAssetHandler())
	}

	api.POST("/signup", Signup(), usecaseMiddleware)
}

func initIntegrationApi(appCtx *ApplicationContext, integrationAPIGroup *echo.Group, usecaseMiddleware echo.MiddlewareFunc) {
	integrationOrigins := allowedIntegrationOrigins(appCtx)
	if len(integrationOrigins) > 0 {
		integrationAPIGroup.Use(middleware.CORS(integrationOrigins...))

		// register dummy OPTIONS route so CORS middleware works fine!
		integrationAPIGroup.OPTIONS("/*", func(ctx *echo.Context) error { return nil })
	}

	// OpenAPI spec endpoint - no auth required
	integrationAPIGroup.GET("/openapi.json", integration.OpenAPISpecHandler())

	// Protected routes
	protected := integrationAPIGroup.Group("")
	protected.Use(authMiddleware(appCtx), AuthRequiredMiddleware(), usecaseMiddleware, private)
	integration.RegisterHandlers(protected, integration.NewStrictHandler(integration.NewServer(), nil))
}

func initAssetsApi(appCtx *ApplicationContext, fileServeGroup *echo.Group) {
	origins := allowedOrigins(appCtx)
	if len(origins) > 0 {
		fileServeGroup.Use(middleware.CORS(origins...))

		// register dummy OPTIONS route so CORS middleware works fine!
		fileServeGroup.OPTIONS("/*", func(ctx *echo.Context) error { return nil })
	}
	serveFiles(fileServeGroup, appCtx)
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
	if appCtx.Config.Dev {
		origins = append(origins, "*")
	}
	return lo.Uniq(origins)
}

func allowedIntegrationOrigins(appCtx *ApplicationContext) []string {
	if appCtx == nil {
		return nil
	}
	origins := append([]string{}, appCtx.Config.Integration_Origins...)
	if appCtx.Config.Dev {
		origins = append(origins, "*")
	}
	return lo.Uniq(origins)
}

func allowedPublicOrigins(appCtx *ApplicationContext) []string {
	if appCtx == nil {
		return nil
	}
	origins := append([]string{}, appCtx.Config.Public_Origins...)
	if appCtx.Config.Dev {
		origins = append(origins, "*")
	}
	return lo.Uniq(origins)
}

func errorMessage(err error, log func(string, ...any)) (int, string) {
	if httpErr, ok := errors.AsType[*echo.HTTPError](err); ok {
		if httpErr.Unwrap() != nil {
			log("echo internal err: %+v", httpErr)
		}
		return httpErr.Code, httpErr.Message
	}

	var sc echo.HTTPStatusCoder
	if errors.As(err, &sc) {
		if code := sc.StatusCode(); code != 0 {
			return code, http.StatusText(code)
		}
	}

	if errors.Is(err, rerror.ErrNotFound) {
		return http.StatusNotFound, "not found"
	}

	if errors.Is(err, rerror.ErrTooManyRequests) {
		return http.StatusTooManyRequests, "too many requests"
	}

	if rErr, ok := errors.AsType[*rerror.E](err); ok {
		return http.StatusBadRequest, rErr.Error()
	}

	if gqlErr, ok := errors.AsType[*gqlerror.Error](err); ok {
		return http.StatusBadRequest, gqlErr.Error()
	}

	log("echo internal err: %+v", err)
	return http.StatusInternalServerError, "internal server error"
}

func errorHandler(next echo.HTTPErrorHandler) echo.HTTPErrorHandler {
	return func(c *echo.Context, err error) {
		resp, _ := echo.UnwrapResponse(c.Response())
		if resp != nil && resp.Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...any) {
			c.Logger().Error(fmt.Sprintf(f, args...))
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(c, err)
		}
	}
}

func private(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		c.Response().Header().Set(echo.HeaderCacheControl, "private, no-store, no-cache, must-revalidate")
		return next(c)
	}
}
