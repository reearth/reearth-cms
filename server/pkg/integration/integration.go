package integration

import (
	"net/url"
	"time"

	"github.com/reearth/reearthx/util"
)

type Integration struct {
	id          ID
	name        string
	description string
	logoUrl     *url.URL
	iType       Type
	token       string
	developer   UserID
	webhook     []*Webhook
	updatedAt   time.Time
}

func (i *Integration) ID() ID {
	return i.id
}

func (i *Integration) Name() string {
	return i.name
}

func (i *Integration) SetName(name string) {
	i.name = name
}

func (i *Integration) Description() string {
	return i.description
}

func (i *Integration) SetDescription(description string) {
	i.description = description
}

func (i *Integration) Type() Type {
	return i.iType
}

func (i *Integration) SetType(t Type) {
	i.iType = t
}

func (i *Integration) LogoUrl() *url.URL {
	return i.logoUrl
}

func (i *Integration) SetLogoUrl(logoUrl *url.URL) {
	i.logoUrl = logoUrl
}

func (i *Integration) Token() string {
	return i.token
}

func (i *Integration) SetToken(token string) {
	i.token = token
}

func (i *Integration) Developer() UserID {
	return i.developer
}

func (i *Integration) SetDeveloper(developer UserID) {
	i.developer = developer
}

func (i *Integration) Webhook() []*Webhook {
	return i.webhook
}

func (i *Integration) SetWebhook(webhook []*Webhook) {
	i.webhook = webhook
}

func (i *Integration) UpdatedAt() time.Time {
	if i.updatedAt.IsZero() {
		return i.id.Timestamp()
	}
	return i.updatedAt
}

func (i *Integration) SetUpdatedAt(updatedAt time.Time) {
	i.updatedAt = updatedAt
}

func (i *Integration) CreatedAt() time.Time {
	return i.id.Timestamp()
}

func (i *Integration) Clone() *Integration {
	if i == nil {
		return nil
	}

	var u *url.URL = nil
	if i.logoUrl != nil {
		u, _ = url.Parse(i.logoUrl.String())
	}
	return &Integration{
		id:          i.id.Clone(),
		name:        i.name,
		description: i.description,
		logoUrl:     u,
		iType:       i.iType,
		token:       i.token,
		developer:   i.developer,
		webhook:     util.Map(i.webhook, func(w *Webhook) *Webhook { return w.Clone() }),
		updatedAt:   i.updatedAt,
	}
}
