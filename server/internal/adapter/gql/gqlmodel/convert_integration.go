package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
)

func ToIntegration(i *integration.Integration, uId *accountdomain.UserID) *Integration {
	if i == nil {
		return nil
	}

	var c *IntegrationConfig = nil
	if uId != nil && i.Developer() == *uId {
		c = &IntegrationConfig{
			Token:    i.Token(),
			Webhooks: ToWebhooks(i.Webhooks()),
		}
	}
	return &Integration{
		ID:          IDFrom(i.ID()),
		Name:        i.Name(),
		Description: new(i.Description()),
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
			OnItemCreate:      new(w.Trigger()[event.ItemCreate]),
			OnItemUpdate:      new(w.Trigger()[event.ItemUpdate]),
			OnItemDelete:      new(w.Trigger()[event.ItemDelete]),
			OnItemPublish:     new(w.Trigger()[event.ItemPublish]),
			OnItemUnPublish:   new(w.Trigger()[event.ItemUnpublish]),
			OnAssetUpload:     new(w.Trigger()[event.AssetCreate]),
			OnAssetDecompress: new(w.Trigger()[event.AssetDecompress]),
			OnAssetDelete:     new(w.Trigger()[event.AssetDelete]),
		},
		Secret:    w.Secret(),
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
