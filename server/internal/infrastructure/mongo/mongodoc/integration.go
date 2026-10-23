package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type IntegrationDocument struct {
	ID          string
	Name        string
	Description string
	LogoUrl     *string
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
	Trigger   map[string]bool
	UpdatedAt time.Time
	Secret    string
}

func NewIntegration(i *integration.Integration) (*IntegrationDocument, string) {
	iId := i.ID().String()
	var w []WebhookDocument
	if i.Webhooks() != nil {
		w = lo.Map(i.Webhooks(), func(w *integration.Webhook, _ int) WebhookDocument {
			return newWebhook(w)
		})
	}
	var logoUrl *string
	if i.LogoUrl() != nil {
		logoUrl = new(i.LogoUrl().String())
	}
	return &IntegrationDocument{
		ID:          iId,
		Name:        i.Name(),
		Description: i.Description(),
		LogoUrl:     logoUrl,
		Type:        string(i.Type()),
		Token:       i.Token(),
		Developer:   i.Developer().String(),
		Webhook:     w,
		UpdatedAt:   i.UpdatedAt(),
	}, iId
}

func newWebhook(w *integration.Webhook) WebhookDocument {
	var trigger map[string]bool
	if w.Trigger() != nil {
		trigger = lo.MapKeys(w.Trigger(), func(_ bool, t event.Type) string {
			return string(t)
		})
	}
	return WebhookDocument{
		ID:        w.ID().String(),
		Name:      w.Name(),
		Url:       w.URL().String(),
		Active:    w.Active(),
		Trigger:   trigger,
		UpdatedAt: w.UpdatedAt(),
		Secret:    w.Secret(),
	}
}

func (d *IntegrationDocument) Model() (*integration.Integration, error) {
	iId, err := id.IntegrationIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	uId, err := accountdomain.UserIDFrom(d.Developer)
	if err != nil {
		return nil, err
	}
	var u *url.URL
	if d.LogoUrl != nil {
		if u, err = url.Parse(*d.LogoUrl); err != nil {
			return nil, err
		}
	}

	var w []*integration.Webhook
	if d.Webhook != nil {
		if w, err = util.TryMap(d.Webhook, WebhookDocument.Model); err != nil {
			return nil, err
		}
	}

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

func (d WebhookDocument) Model() (*integration.Webhook, error) {
	wId, err := id.WebhookIDFrom(d.ID)
	if err != nil {
		return nil, err
	}

	u, err := url.Parse(d.Url)
	if err != nil {
		return nil, err
	}

	var trigger integration.WebhookTrigger
	if d.Trigger != nil {
		trigger = lo.MapKeys(d.Trigger, func(_ bool, t string) event.Type {
			return event.Type(t)
		})
	}
	return integration.NewWebhookBuilder().
		ID(wId).
		Name(d.Name).
		Active(d.Active).
		Url(u).
		UpdatedAt(d.UpdatedAt).
		Trigger(trigger).
		Secret(d.Secret).
		Build()
}

type IntegrationConsumer = mongox.SliceFuncConsumer[*IntegrationDocument, *integration.Integration]

func NewIntegrationConsumer() *IntegrationConsumer {
	return NewConsumer[*IntegrationDocument, *integration.Integration]()
}
