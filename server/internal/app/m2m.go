package app

import (
	"encoding/base64"
	"encoding/json"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	rhttp "github.com/reearth/reearth-cms/server/internal/adapter/http"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/appx"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func NotifyHandler() echo.HandlerFunc {
	return func(c *echo.Context) error {
		ctx := c.Request().Context()
		input, err := parsePubSubMessage(c)
		if err != nil {
			log.Errorfc(ctx, "failed to parse request body: %s", err.Error())
			return err
		}

		log.Infofc(ctx, "notified and updating files begin: assetID=%s type=%s status=%s", input.AssetID, input.Type, input.Status)

		assetUC := adapter.Usecases(ctx).Asset
		controller := rhttp.NewTaskController(assetUC)

		if err := controller.Notify(ctx, input); err != nil {
			log.Errorf("failed to update files: assetID=%s, type=%s, status=%s, err=%v", input.AssetID, input.Type, input.Status, err)
			return err
		}

		log.Infof("successfully notified and files has been updated: assetID=%s, type=%s, status=%s", input.AssetID, input.Type, input.Status)
		return c.JSON(http.StatusOK, "OK")
	}
}

func parsePubSubMessage(c *echo.Context) (rhttp.NotifyInput, error) {
	var input rhttp.NotifyInput
	var b pubsubBody
	if err := c.Bind(&b); err != nil {
		if err := c.Bind(&input); err != nil {
			return input, err
		}
	}

	if b.Message.Attributes.BuildID != "" {
		input = rhttp.NotifyInput{
			Type:    "assetDecompressTaskNotify",
			AssetID: "-",
			Status:  new(asset.ArchiveExtractionStatus),
			Task: &rhttp.NotifyInputTask{
				TaskID: b.Message.Attributes.BuildID,
				Status: b.Message.Attributes.Status,
			},
		}
	} else if data, err := b.Data(); err != nil {
		return input, err
	} else if err := json.Unmarshal(data, &input); err != nil {
		return input, err
	}

	return input, nil
}

type pubsubBody struct {
	Message struct {
		Attributes struct {
			BuildID string `json:"buildId"`
			Status  string `json:"status"`
		} `json:"attributes"`
		Data string `json:"data"`
	} `json:"message"`
}

func (b pubsubBody) Data() ([]byte, error) {
	if b.Message.Data == "" {
		return nil, nil
	}

	return base64.StdEncoding.DecodeString(b.Message.Data)
}

func M2MAuthMiddleware(cfg *Config) echo.MiddlewareFunc {
	m2mAuthMiddleware := echo.WrapMiddleware(lo.Must(
		appx.AuthMiddleware(cfg.AuthM2M.JWTProvider(), adapter.ContextAuthInfo, false), // it shoud not be optional
	))

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return m2MGenerateOperatorMiddleware(cfg.AuthM2M.Email)(m2mAuthMiddleware(next))
	}
}

func m2MGenerateOperatorMiddleware(email string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			ctx := c.Request().Context()
			if ai, ok := ctx.Value(adapter.ContextAuthInfo).(appx.AuthInfo); ok {
				if ai.EmailVerified == nil || !*ai.EmailVerified || ai.Email != email {
					return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
				}
			}

			op, err := generateMachineOperator()
			if err != nil {
				return err
			}

			ctx = adapter.AttachOperator(ctx, op)
			c.SetRequest(c.Request().WithContext(ctx))

			return next(c)
		}
	}
}

func generateMachineOperator() (*usecase.Operator, error) {
	return &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: nil,
		},
		Integration: nil,
		Machine:     true,
	}, nil
}
