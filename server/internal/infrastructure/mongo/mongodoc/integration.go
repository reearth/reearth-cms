package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/event"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/account/accountdomain"
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
	Trigger   map[string]bool
	UpdatedAt time.Time
	Secret    string
}

func NewIntegration(i *integration.Integration) (*IntegrationDocument, string) {
	iId := i.ID().String()
	w := lo.Map(i.Webhooks(), func(w *integration.Webhook, _ int) WebhookDocument {
		trigger := lo.MapKeys(w.Trigger(), func(_ bool, t event.Type) string {
			return string(t)
		})
		return WebhookDocument{
			ID:        w.ID().String(),
			Name:      w.Name(),
			Url:       w.URL().String(),
			Active:    w.Active(),
			Trigger:   trigger,
			UpdatedAt: w.UpdatedAt(),
			Secret:    w.Secret(),
		}
	})
	var logoUrl string
	if i.LogoUrl() != nil {
		logoUrl = i.LogoUrl().String()
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

func (d *IntegrationDocument) Model() (*integration.Integration, error) {
	iId, err := id.IntegrationIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	uId, err := accountdomain.UserIDFrom(d.Developer)
	if err != nil {
		return nil, err
	}
	// a nil logo URL is stored as an empty one
	var u *url.URL
	if d.LogoUrl != "" {
		if u, err = url.Parse(d.LogoUrl); err != nil {
			return nil, err
		}
	}

	// a webhook that can not be read is skipped, as a nil entry breaks callers
	w := lo.FilterMap(d.Webhook, func(d WebhookDocument, _ int) (*integration.Webhook, bool) {
		wId, err := id.WebhookIDFrom(d.ID)
		if err != nil {
			return nil, false
		}

		u, err := url.Parse(d.Url)
		if err != nil {
			return nil, false
		}

		trigger := lo.MapKeys(d.Trigger, func(_ bool, t string) event.Type {
			return event.Type(t)
		})
		m, err := integration.NewWebhookBuilder().
			ID(wId).
			Name(d.Name).
			Active(d.Active).
			Url(u).
			UpdatedAt(d.UpdatedAt).
			Trigger(trigger).
			Secret(d.Secret).
			Build()
		return m, err == nil
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
	return NewConsumer[*IntegrationDocument, *integration.Integration]()
}
