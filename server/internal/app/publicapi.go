package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func PublicApiItemList() echo.HandlerFunc {
	return func(c echo.Context) error {
		projectName := c.Param("projectName")
		schemaKey := c.Param("schemaKey")
		/*
			uc := adapter.Usecases(c.Request().Context())
			controller := http1.NewUserController(uc.User)
			output, err := controller.SignUp(c.Request().Context(), inp)
			if err != nil {
				return err
			}
		*/
		return c.JSON(http.StatusOK, output)
	}
}

func PublicApiItem() echo.HandlerFunc {
	return func(c echo.Context) error {

	}
}
