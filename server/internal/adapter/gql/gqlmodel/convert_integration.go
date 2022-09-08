package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func ToIntegration(i *integration.Integration) *Integration {
	if i == nil {
		return nil
	}

	return &Integration{
		ID:          IDFrom(i.ID()),
		Name:        i.Name(),
		Description: lo.ToPtr(i.Description()),
		LogoURL:     *i.LogoUrl(),
		IType:       ToIntegrationType(i.Type()),
		DeveloperID: IDFrom(i.Developer()),
		Developer:   nil,
		Config: &IntegrationConfig{
			Token:    i.Token(),
			Webhooks: ToWebhooks(i.Webhook()),
		},
		CreatedAt: i.ID().Timestamp(),
		UpdatedAt: i.UpdatedAt(),
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
		URL:    *w.Url(),
		Active: w.Active(),
		Trigger: &WebhookTrigger{
			OnItemCreate:    lo.ToPtr(w.Trigger().OnItemCreate),
			OnItemUpdate:    lo.ToPtr(w.Trigger().OnItemUpdate),
			OnItemDelete:    lo.ToPtr(w.Trigger().OnItemDelete),
			OnAssetUpload:   lo.ToPtr(w.Trigger().OnAssetUpload),
			OnAssetDeleted:  lo.ToPtr(w.Trigger().OnAssetDeleted),
			OnItemPublish:   lo.ToPtr(w.Trigger().OnItemPublish),
			OnItemUnPublish: lo.ToPtr(w.Trigger().OnItemUnPublish),
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
