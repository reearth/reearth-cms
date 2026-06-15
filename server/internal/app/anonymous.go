package app

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearthx/account/accountusecase"
)

func generateAnonymousOperator() (*usecase.Operator, error) {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
		Integration: nil,
		Anonymous:   true,
	}, nil
}

func AnonymousOperatorMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			op, err := generateAnonymousOperator()
			if err != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate operator"})
			}
			ctx := adapter.AttachOperator(c.Request().Context(), op)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}
