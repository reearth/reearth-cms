package app

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	rhttp "github.com/reearth/reearth-cms/server/internal/adapter/http"
	"github.com/reearth/reearthx/log"
)

func NotifyHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		switch c.Request().Header.Get("X-Amz-Sns-Message-Type") {
		case string(rhttp.SubscriptionConfirmation):
			return subscriptionConfirmationHandler(c)
		case string(rhttp.Notification):
			return notificationHandler(c)
		default:
			return defaultHandler(c)
		}
	}
}

func subscriptionConfirmationHandler(c echo.Context) error {
	var req rhttp.SubscriptionConfirmationRequest
	if err := req.Bind(c.Request()); err != nil {
		return fmt.Errorf("request binding: %w", err)
	}
	log.Infof("SubscribeURL: %#v", req.SubscribeURL)

	return c.NoContent(http.StatusOK)
}

func notificationHandler(c echo.Context) error {
	var req rhttp.NotificationRequest
	if err := req.Bind(c.Request()); err != nil {
		return fmt.Errorf("request binding: %w", err)
	}

	var input rhttp.NotifyInput
	if err := json.Unmarshal([]byte(req.Message), &input); err != nil {
		return fmt.Errorf("Failed to parse JSON: %v", err)
	}

	ctx := c.Request().Context()

	log.Infof("notified and updating files begin: assetID=%s type=%s status=%s", input.AssetID, input.Type, input.Status)
	assetUC := adapter.Usecases(ctx).Asset
	controller := rhttp.NewTaskController(assetUC)
	if err := controller.Notify(ctx, input); err != nil {
		log.Errorf("failed to update files: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
		return err
	}
	log.Infof("successfully notified and files has been updated: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
	return c.NoContent(http.StatusOK)
}

func defaultHandler(c echo.Context) error {
	var input rhttp.NotifyInput
	var b msgBody
	if err := c.Bind(&b); err != nil {
		if err := c.Bind(&input); err != nil {
			return err
		}
	} else if data, err := b.Data(); err != nil {
		return err
	} else if err := json.Unmarshal(data, &input); err != nil {
		return err
	}

	ctx := c.Request().Context()

	log.Infof("notified and updating files begin: assetID=%s type=%s status=%s", input.AssetID, input.Type, input.Status)
	assetUC := adapter.Usecases(ctx).Asset
	controller := rhttp.NewTaskController(assetUC)
	if err := controller.Notify(ctx, input); err != nil {
		log.Errorf("failed to update files: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
		return err
	}
	log.Infof("successfully notified and files has been updated: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
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
