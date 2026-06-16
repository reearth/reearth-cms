package app

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/publicapi"
	"github.com/reearth/reearth-cms/server/internal/usecase"
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

	publicAPIGroup.Use(publicAPIAuthMiddleware(appCtx), usecaseMiddleware)
	publicapi.Echo(publicAPIGroup, PublicAPIPostingMiddleware())
}

func PublicAPIPostingMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			ctx := adapter.AttachOperator(c.Request().Context(), usecase.NewAnonymousOperator())
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}
