package app

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	http1 "github.com/reearth/reearth-cms/server/internal/adapter/http"
)

func Ping() echo.HandlerFunc {
	return func(c *echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	}
}

func Signup() echo.HandlerFunc {
	return func(c *echo.Context) error {
		var inp http1.SignupInput
		if err := c.Bind(&inp); err != nil {
			return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("failed to parse request body: %v", err))
		}

		uc := adapter.Usecases(c.Request().Context())
		controller := http1.NewUserController(uc.User)
		output, err := controller.Signup(c.Request().Context(), inp)
		if err != nil {
			return err
		}

		return c.JSON(http.StatusOK, output)
	}
}
