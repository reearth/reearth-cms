package interfaces

import (
	"context"
	"net/url"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
)

type CreateIntegrationParam struct {
	Name        string
	Description *string
	Type        integration.Type
	Logo        url.URL
}

type UpdateIntegrationParam struct {
	Name        *string
	Description *string
	Logo        *url.URL
}

type CreateWebhookParam struct {
	Name    string
	URL     url.URL
	Active  bool
	Trigger *WebhookTriggerParam
}

type UpdateWebhookParam struct {
	Name    *string
	URL     *url.URL
	Active  *bool
	Trigger *WebhookTriggerParam
}

type WebhookTriggerParam struct {
	OnItemCreate    bool
	OnItemUpdate    bool
	OnItemDelete    bool
	OnAssetUpload   bool
	OnAssetDeleted  bool
	OnItemPublish   bool
	OnItemUnpublish bool
}

type Integration interface {
	FindByIDs(context.Context, id.IntegrationIDList, *usecase.UserOperator) (integration.List, error)
	FindByMe(context.Context, *usecase.UserOperator) (integration.List, error)
	Create(context.Context, CreateIntegrationParam, *usecase.UserOperator) (*integration.Integration, error)
	Update(context.Context, id.IntegrationID, UpdateIntegrationParam, *usecase.UserOperator) (*integration.Integration, error)
	Delete(context.Context, id.IntegrationID, *usecase.UserOperator) error

	CreateWebhook(context.Context, id.IntegrationID, CreateWebhookParam, *usecase.UserOperator) (*integration.Webhook, error)
	UpdateWebhook(context.Context, id.IntegrationID, id.WebhookID, UpdateWebhookParam, *usecase.UserOperator) (*integration.Webhook, error)
	DeleteWebhook(context.Context, id.IntegrationID, id.WebhookID, *usecase.UserOperator) error
}
