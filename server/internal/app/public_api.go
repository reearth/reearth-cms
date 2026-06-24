package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/publicapi"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountusecase"
	"golang.org/x/text/language"
)

func initPublicApi(appCtx *ApplicationContext, publicAPIGroup *echo.Group, usecaseMiddleware echo.MiddlewareFunc) {
	publicOrigins := allowedPublicOrigins(appCtx)
	if len(publicOrigins) > 0 {
		publicAPIGroup.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: publicOrigins,
			// Skip the global CORS middleware for the posting endpoint's OPTIONS
			// preflight — PreflightItem() handles origin validation per-project.
			Skipper: func(c *echo.Context) bool {
				return c.Request().Method == http.MethodOptions &&
					strings.HasSuffix(c.Request().URL.Path, "/items")
			},
		}))

		// register dummy OPTIONS route so CORS middleware works fine!
		publicAPIGroup.OPTIONS("/*", func(ctx *echo.Context) error { return nil })
	}

	publicAPIGroup.Use(publicAPIAuthMiddleware(appCtx), usecaseMiddleware, AnonymousOperatorMiddleware())
	publicapi.Echo(publicAPIGroup, publicApiRateLimit(appCtx))
}

func publicApiRateLimit(appCtx *ApplicationContext) publicapi.RateLimitConfig {
	if appCtx == nil {
		return publicapi.RateLimitConfig{}
	}
	return publicapi.RateLimitConfig{
		Limit:  appCtx.Config.Public_RateLimit.Limit,
		Window: appCtx.Config.Public_RateLimit.Window,
	}
}

func AnonymousOperatorMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			op, err := generateAnonymousOperator(language.English.String())
			if err != nil {
				return err
			}
			ctx := adapter.AttachOperator(c.Request().Context(), op)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}

func generateAnonymousOperator(lang string) (*usecase.Operator, error) {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
		Integration: nil,
		Machine:     false,
		Anonymous:   true,
		Lang:        lang,
	}, nil
}
