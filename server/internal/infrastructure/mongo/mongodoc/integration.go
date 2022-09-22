package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type IntegrationDocument struct {
	ID          string
	Name        string
	Description string
	LogoUrl     string
	Type        string
	Token       string
	Developer   string
	Webhook     []WebhookDocument
	UpdatedAt   time.Time
}

type WebhookDocument struct {
	ID        string
	Name      string
	Url       string
	Active    bool
	Trigger   WebhookTriggerDocument
	UpdatedAt time.Time
}

type WebhookTriggerDocument struct {
	OnItemCreate    bool
	OnItemUpdate    bool
	OnItemDelete    bool
	OnAssetUpload   bool
	OnAssetDeleted  bool
	OnItemPublish   bool
	OnItemUnPublish bool
}

func NewIntegration(i *integration.Integration) (*IntegrationDocument, string) {
	iId := i.ID().String()
	w := lo.Map(i.Webhooks(), func(w *integration.Webhook, _ int) WebhookDocument {
		t := WebhookTriggerDocument{
			OnItemCreate:    w.Trigger().OnItemCreate,
			OnItemUpdate:    w.Trigger().OnItemUpdate,
			OnItemDelete:    w.Trigger().OnItemDelete,
			OnAssetUpload:   w.Trigger().OnAssetUpload,
			OnAssetDeleted:  w.Trigger().OnAssetDeleted,
			OnItemPublish:   w.Trigger().OnItemPublish,
			OnItemUnPublish: w.Trigger().OnItemUnPublish,
		}
		return WebhookDocument{
			ID:        w.ID().String(),
			Name:      w.Name(),
			Url:       w.Url().String(),
			Active:    w.Active(),
			Trigger:   t,
			UpdatedAt: w.UpdatedAt(),
		}
	})
	return &IntegrationDocument{
		ID:          iId,
		Name:        i.Name(),
		Description: i.Description(),
		LogoUrl:     i.LogoUrl().String(),
		Type:        string(i.Type()),
		Token:       i.Token(),
		Developer:   i.Developer().String(),
		Webhook:     w,
		UpdatedAt:   i.UpdatedAt(),
	}, iId
}

func (d *IntegrationDocument) Model() (*integration.Integration, error) {
	iId, err := id.IntegrationIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	uId, err := id.UserIDFrom(d.Developer)
	if err != nil {
		return nil, err
	}
	u, err := url.Parse(d.LogoUrl)
	if err != nil {
		return nil, err
	}

	w := lo.Map(d.Webhook, func(d WebhookDocument, _ int) *integration.Webhook {
		wId, err := id.WebhookIDFrom(d.ID)
		if err != nil {
			return nil
		}

		u, err := url.Parse(d.Url)
		if err != nil {
			return nil
		}

		t := integration.WebhookTrigger{
			OnItemCreate:    d.Trigger.OnItemCreate,
			OnItemUpdate:    d.Trigger.OnItemUpdate,
			OnItemDelete:    d.Trigger.OnItemDelete,
			OnAssetUpload:   d.Trigger.OnAssetUpload,
			OnAssetDeleted:  d.Trigger.OnAssetDeleted,
			OnItemPublish:   d.Trigger.OnItemPublish,
			OnItemUnPublish: d.Trigger.OnItemUnPublish,
		}

		m, err := integration.NewWebhookBuilder().
			ID(wId).
			Name(d.Name).
			Active(d.Active).
			Url(u).
			UpdatedAt(d.UpdatedAt).
			Trigger(t).
			Build()
		if err != nil {
			return nil
		}

		return m
	})

	return integration.New().
		ID(iId).
		Name(d.Name).
		Description(d.Description).
		Token(d.Token).
		Type(integration.TypeFrom(d.Type)).
		Developer(uId).
		LogoUrl(u).
		UpdatedAt(d.UpdatedAt).
		Webhook(w).
		Build()
}

type IntegrationConsumer = mongox.SliceFuncConsumer[*IntegrationDocument, *integration.Integration]

func NewIntegrationConsumer() *IntegrationConsumer {
	return NewComsumer[*IntegrationDocument, *integration.Integration]()
}
