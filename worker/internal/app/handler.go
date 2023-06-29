package app

import (
	"encoding/base64"
	"encoding/json"
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
		if c.Request().Header.Get("X-Amz-Sns-Message-Type") == "Notification" {
			var req struct {
				Message string
			}
			if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
				return err
			}
			if err := json.Unmarshal([]byte(req.Message), &input); err != nil {
				return err
			}
		} else {
			if err := c.Bind(&input); err != nil {
				log.Errorf("failed to decompress: err=%s", err.Error())
				return err
			}
		}

		if err := h.Controller.DecompressController.Decompress(c.Request().Context(), input); err != nil {
			log.Errorf("failed to decompress. input: %#v err:%s", input, err.Error())
			return err
		}
		log.Infof("successfully decompressed: Asset=%s, Path=%s", input.AssetID, input.Path)
		return c.NoContent(http.StatusOK)
	}
}

func (h Handler) WebhookHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var w webhook.Webhook
		if c.Request().Header.Get("X-Amz-Sns-Message-Type") == "Notification" {
			var req struct {
				Message string
			}
			if err := json.NewDecoder(c.Request().Body).Decode(&req); err != nil {
				return err
			}
			if err := json.Unmarshal([]byte(req.Message), &w); err != nil {
				return err
			}
		} else {
			var msg msgBody
			if err := c.Bind(&msg); err != nil {
				if err := c.Bind(&w); err != nil {
					return err
				}
			} else if data, err := msg.Data(); err != nil {
				return err
			} else if err := json.Unmarshal(data, &w); err != nil {
				return err
			}
		}

		if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &w); err != nil {
			log.Errorf("failed to send webhook. webhook: %#v err:%s", w, err.Error())
			return err
		}

		log.Info("webhook has been sent: %#v", w)
		return c.NoContent(http.StatusOK)
	}
}

type msgBody struct {
	Message struct {
		Data string `json:"data"`
	} `json:"message"`
}

func (b msgBody) Data() ([]byte, error) {
	if b.Message.Data == "" {
		return nil, nil
	}

	return base64.StdEncoding.DecodeString(b.Message.Data)
}
