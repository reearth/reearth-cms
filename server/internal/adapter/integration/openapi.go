package integration

import (
	"bytes"
	"net/http"

	"github.com/labstack/echo/v4"
)

func OpenAPISpecHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		spec, err := rawSpec()
		if err != nil {
			return err
		}

		if wID := c.QueryParam("workspaceId"); wID != "" {
			spec = bytes.ReplaceAll(spec, []byte("{workspaceIdOrAlias}"), []byte(wID))
		}

		return c.JSONBlob(http.StatusOK, spec)
	}
}
