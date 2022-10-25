package app

import (
	"encoding/base64"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	rhttp "github.com/reearth/reearth-cms/server/internal/adapter/http"
	"github.com/reearth/reearthx/appx"
)

func M2MAuthMiddleware(email string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if ai := c.Request().Context().Value(contextAuthInfo).(*appx.AuthInfo); ai != nil {
				if ai.EmailVerified == nil || !*ai.EmailVerified || ai.Email != email {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				}
			}
			return next(c)
		}
	}
}

func NotifyHandler() echo.HandlerFunc {
	return func(c echo.Context) error {
		var input rhttp.NotifyInput
		var b pubsubBody
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

		assetUC := adapter.Usecases(ctx).Asset
		controller := rhttp.NewTaskController(assetUC)
		if err := controller.Notify(ctx, input); err != nil {
			return err
		}
		return c.NoContent(http.StatusOK)
	}
}

type pubsubBody struct {
	Message struct {
		Data string `json:"data"`
	} `json:"message"`
}

func (b pubsubBody) Data() ([]byte, error) {
	if b.Message.Data == "" {
		return nil, nil
	}

	return base64.StdEncoding.DecodeString(b.Message.Data)
}
