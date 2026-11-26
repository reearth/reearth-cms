package app

import (
	"encoding/base64"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v5"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/reearth/reearth-cms/worker/pkg/webhook"
	"github.com/reearth/reearthx/log"
)

type Handler struct {
	Controller *rhttp.Controller
	PubSubAuth *PubSubAuthenticator
}

func NewHandler(c *rhttp.Controller, pubSubAuth *PubSubAuthenticator) *Handler {
	return &Handler{Controller: c, PubSubAuth: pubSubAuth}
}

func (h Handler) DecompressHandler() echo.HandlerFunc {
	return func(c *echo.Context) error {
		if err := h.PubSubAuth.Authenticate(c.Request()); err != nil {
			return err
		}

		input, err := parsePubSubDecompressMessage(c)
		if err != nil {
			log.Errorf("failed to parse request body: %s", err.Error())
			return err
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
	return func(c *echo.Context) error {
		if err := h.PubSubAuth.Authenticate(c.Request()); err != nil {
			return err
		}

		webhook, err := parsePubSubWebhookMessage(c)
		if err != nil {
			log.Errorf("failed to parse request body: %s", err.Error())
			return err
		}

		if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &webhook); err != nil {
			log.Errorf("failed to send webhook. webhook: %#v err:%s", webhook, err.Error())
			return err
		}

		log.Infof("webhook has been sent: %#v", webhook)
		return c.NoContent(http.StatusOK)
	}
}

func parsePubSubDecompressMessage(c *echo.Context) (rhttp.DecompressInput, error) {
	var input rhttp.DecompressInput

	if err := c.Bind(&input); err != nil {
		log.Errorf("failed to decompress: err=%s", err.Error())
		return input, err
	}

	return input, nil
}

func parsePubSubWebhookMessage(c *echo.Context) (webhook.Webhook, error) {
	var msg msgBody
	var w webhook.Webhook

	if err := c.Bind(&msg); err != nil {
		if err := c.Bind(&w); err != nil {
			return w, err
		}
	} else if data, err := msg.Data(); err != nil {
		return w, err
	} else if err := json.Unmarshal(data, &w); err != nil {
		return w, err
	}

	return w, nil
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
