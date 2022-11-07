package app

import (
	"net/http"

	"github.com/labstack/echo/v4"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/reearth/reearth-cms/worker/pkg/webhook"
	"github.com/reearth/reearthx/log"
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
			log.Errorf("failed to decompress. input: %#v err:%s", input, err.Error())

			return err
		}
		return c.NoContent(http.StatusOK)
	}
}

func (h Handler) WebhookHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var w webhook.Webhook
		if err := c.Bind(&w); err != nil {
			return err
		}

		if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &w); err != nil {
			log.Errorf("failed to send webhook. webhook: %#v err:%s", w, err.Error())
			return err
		}

		log.Info("webhook has been sent: %#v", w)
		return c.NoContent(http.StatusOK)
	}
}
