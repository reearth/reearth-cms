package integration

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func OpenAPISpecHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		spec, err := rawSpec()
		if err != nil {
			return err
		}
		return c.JSONBlob(http.StatusOK, spec)
	}
}
