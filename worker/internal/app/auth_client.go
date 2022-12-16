package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/appx"
)

type ContextKey string

const ContextAuthInfo ContextKey = "authinfo"

func M2MAuthMiddleware(email string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.Request().Context()
			if ai, ok := ctx.Value(ContextAuthInfo).(appx.AuthInfo); ok {
				if ai.EmailVerified == nil || !*ai.EmailVerified || ai.Email != email {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				}
				c.SetRequest(c.Request().WithContext(ctx))
			}
			return next(c)
		}
	}
}
