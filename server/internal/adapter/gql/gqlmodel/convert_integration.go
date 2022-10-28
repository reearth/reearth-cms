package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func ToIntegration(i *integration.Integration, uId id.UserID) *Integration {
	if i == nil {
		return nil
	}

	var c *IntegrationConfig = nil
	if i.Developer() == uId {
		c = &IntegrationConfig{
			Token:    i.Token(),
			Webhooks: ToWebhooks(i.Webhooks()),
		}
	}
	return &Integration{
		ID:          IDFrom(i.ID()),
		Name:        i.Name(),
		Description: lo.ToPtr(i.Description()),
		LogoURL:     *i.LogoUrl(),
		IType:       ToIntegrationType(i.Type()),
		DeveloperID: IDFrom(i.Developer()),
		Developer:   nil,
		Config:      c,
		CreatedAt:   i.ID().Timestamp(),
		UpdatedAt:   i.UpdatedAt(),
	}
}

func ToIntegrationType(t integration.Type) IntegrationType {
	switch t {
	case integration.TypePublic:
		return IntegrationTypePublic
	case integration.TypePrivate:
		return IntegrationTypePrivate
	default:
		return ""
	}
}

func ToWebhook(w *integration.Webhook) *Webhook {
	if w == nil {
		return nil
	}
	return &Webhook{
		ID:     IDFrom(w.ID()),
		Name:   w.Name(),
		URL:    *w.URL(),
		Active: w.Active(),
		Trigger: &WebhookTrigger{
			OnItemCreate:    lo.ToPtr(w.Trigger()["item.create"]),
			OnItemUpdate:    lo.ToPtr(w.Trigger()["item.update"]),
			OnItemDelete:    lo.ToPtr(w.Trigger()["item.delete"]),
			OnItemPublish:   lo.ToPtr(w.Trigger()["item.publish"]),
			OnItemUnPublish: lo.ToPtr(w.Trigger()["item.unpublish"]),
			OnAssetUpload:   lo.ToPtr(w.Trigger()["asset.create"]),
			OnAssetDeleted:  lo.ToPtr(w.Trigger()["asset.delete"]),
		},
		CreatedAt: w.CreatedAt(),
		UpdatedAt: w.UpdatedAt(),
	}
}

func ToWebhooks(ws []*integration.Webhook) []*Webhook {
	if len(ws) == 0 {
		return []*Webhook{}
	}
	return util.Map(ws, func(w *integration.Webhook) *Webhook {
		return ToWebhook(w)
	})
}
