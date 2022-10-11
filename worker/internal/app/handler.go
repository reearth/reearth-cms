package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
)

type Handler struct {
	Controller *rhttp.Controller
}

func NewHandler(c *rhttp.Controller) *Handler {
	return &Handler{Controller: c}
}

func (h Handler) DecompressHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var input rhttp.DecompressInput
		if err := c.Bind(&input); err != nil {
			return err
		}

		if err := h.Controller.DecompressController.Decompress(c.Request().Context(), input); err != nil {
			return err
		}
		return c.NoContent(http.StatusOK)
	}
}
