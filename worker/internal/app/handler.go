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

type SubscriptionConfirmation struct {
	Type             string `json:"Type"`
	MessageId        string `json:"MessageId"`
	Token            string `json:"Token"`
	TopicArn         string `json:"TopicArn"`
	Message          string `json:"Message"`
	SubscribeURL     string `json:"SubscribeURL"`
	Timestamp        string `json:"Timestamp"`
	SignatureVersion string `json:"SignatureVersion"`
	Signature        string `json:"Signature"`
	SigningCertURL   string `json:"SigningCertURL"`
}

func (h Handler) DecompressHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		// SNS Subscription Confirmation
		req := c.Request()
		t := req.Header.Get("x-amz-sns-message-type")
		if t == "SubscriptionConfirmation" {
			var confirmation SubscriptionConfirmation
			if err := c.Bind(&confirmation); err != nil {
				log.Errorf("failed to bind request body: %s", err.Error())
				return err
			}

			log.Infof("SubscriberURL: %s", confirmation.SubscribeURL)
			return c.JSON(http.StatusOK, "ok")
		}
		
		// Decompress
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
}

func (h Handler) WebhookHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
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
