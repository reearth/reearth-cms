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

const (
	MessageHeader            = "X-Amz-Sns-Message-Type"
	SubscriptionConfirmation = "SubscriptionConfirmation"
	Notification             = "Notification"
)

type Handler struct {
	Controller *rhttp.Controller
}

func NewHandler(c *rhttp.Controller) *Handler {
	return &Handler{Controller: c}
}

func (h Handler) DecompressHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		header := c.Request().Header.Get(MessageHeader)
		if header != "" {
			if header == string(SubscriptionConfirmation) {
				return h.subscriptionConfirmationHandler(c)
			} else {
				return h.decompressNotificationHandler(c)
			}
		} else {
			return h.decompressDefaultHandler(c)
		}
	}
}

func (h Handler) decompressNotificationHandler(c echo.Context) error {
	var req NotificationRequest
	if err := req.Bind(c.Request()); err != nil {
		return err
	}

	var input rhttp.DecompressInput
	if err := json.Unmarshal([]byte(req.Message), &input); err != nil {
		return err
	}
	log.Infof("decompression start: Asset=%s, Path=%s", input.AssetID, input.Path)

	if err := h.Controller.DecompressController.Decompress(c.Request().Context(), input); err != nil {
		log.Errorf("failed to decompress. input: %#v err:%s", input, err.Error())
		return err
	}
	log.Infof("successfully decompressed: Asset=%s, Path=%s", input.AssetID, input.Path)

	return c.NoContent(http.StatusOK)
}

func (h Handler) decompressDefaultHandler(c echo.Context) error {
	var input rhttp.DecompressInput
	if err := c.Bind(&input); err != nil {
		log.Errorf("failed to decompress: err=%s", err.Error())
		return err
	}
	log.Infof("decompression start: Asset=%s, Path=%s", input.AssetID, input.Path)

	if err := h.Controller.DecompressController.Decompress(c.Request().Context(), input); err != nil {
		log.Errorf("failed to decompress. input: %#v err:%s", input, err.Error())
		return err
	}
	log.Infof("successfully decompressed: Asset=%s, Path=%s", input.AssetID, input.Path)

	return c.NoContent(http.StatusOK)
}

func (h Handler) WebhookHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		header := c.Request().Header.Get(MessageHeader)
		if header != "" {
			if header == string(SubscriptionConfirmation) {
				return h.subscriptionConfirmationHandler(c)
			} else {
				return h.webhookNotificationHandler(c)
			}
		} else {
			return h.webhookDefaultHandler(c)
		}
	}
}

func (h Handler) webhookNotificationHandler(c echo.Context) error {
	var req NotificationRequest
	if err := req.Bind(c.Request()); err != nil {
		return err
	}

	var w webhook.Webhook
	if err := json.Unmarshal([]byte(req.Message), &w); err != nil {
		return err
	}

	if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &w); err != nil {
		log.Errorf("failed to send webhook. webhook: %#v err:%s", w, err.Error())
		return err
	}

	log.Info("webhook has been sent: %#v", w)
	return c.NoContent(http.StatusOK)
}

func (h Handler) webhookDefaultHandler(c echo.Context) error {
	var msg msgBody
	var w webhook.Webhook
	if err := c.Bind(&msg); err != nil {
		if err := c.Bind(&w); err != nil {
			return err
		}
	} else if data, err := msg.Data(); err != nil {
		return err
	} else if err := json.Unmarshal(data, &w); err != nil {
		return err
	}

	if err := h.Controller.WebhookController.Webhook(c.Request().Context(), &w); err != nil {
		log.Errorf("failed to send webhook. webhook: %#v err:%s", w, err.Error())
		return err
	}

	log.Info("webhook has been sent: %#v", w)
	return c.NoContent(http.StatusOK)
}

func (h Handler) subscriptionConfirmationHandler(c echo.Context) error {
	var req SubscriptionConfirmationRequest
	if err := req.Bind(c.Request()); err != nil {
		return err
	}
	log.Infof("SubscribeURL: %#v", req.SubscribeURL)

	return c.NoContent(http.StatusOK)
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

type SubscriptionConfirmationRequest struct {
	SubscribeURL string
}

type NotificationRequest struct {
	Message string
}

func (s *SubscriptionConfirmationRequest) Bind(r *http.Request) error {
	return json.NewDecoder(r.Body).Decode(s)
}

func (n *NotificationRequest) Bind(r *http.Request) error {
	return json.NewDecoder(r.Body).Decode(n)
}
