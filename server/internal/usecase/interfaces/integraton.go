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
	OnItemUnPublish bool
}

type Integration interface {
	FindByIDs(context.Context, []id.IntegrationID, *usecase.Operator) (integration.List, error)
	FindByUser(context.Context, id.UserID, *usecase.Operator) (integration.List, error)
	Create(context.Context, CreateIntegrationParam, id.UserID, *usecase.Operator) (*integration.Integration, error)
	Update(context.Context, id.IntegrationID, UpdateIntegrationParam, *usecase.Operator) (*integration.Integration, error)
	Delete(context.Context, id.IntegrationID, *usecase.Operator) error

	CreateWebhook(context.Context, id.IntegrationID, CreateWebhookParam, *usecase.Operator) (*integration.Webhook, error)
	UpdateWebhook(context.Context, id.IntegrationID, id.WebhookID, UpdateWebhookParam, *usecase.Operator) (*integration.Webhook, error)
	DeleteWebhook(context.Context, id.IntegrationID, id.WebhookID, *usecase.Operator) error
}
