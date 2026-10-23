package integration

import (
	"errors"
	"net/url"
	"slices"
	"time"

	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

var (
	ErrInvalidType    = errors.New("invalid integration type")
	ErrInvalidWebhook = errors.New("invalid webhook")
)

const charSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

type Integration struct {
	id          ID
	name        string
	description string
	logoUrl     *url.URL
	iType       Type
	token       string
	developer   UserID
	webhooks    []*Webhook
	updatedAt   time.Time
}

// Validate returns an error when the integration can not be stored: it needs a
// developer and a known type, and every webhook needs a URL.
func (i *Integration) Validate() error {
	if i == nil {
		return rerror.ErrInvalidParams
	}
	if i.developer.IsNil() {
		return ErrInvalidID
	}
	if i.iType != TypePublic && i.iType != TypePrivate {
		return ErrInvalidType
	}
	for _, w := range i.webhooks {
		if w == nil || w.url == nil {
			return ErrInvalidWebhook
		}
	}
	return nil
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

func (i *Integration) RandomToken() {
	i.token = "secret_" + lo.RandomString(43, []rune(charSet))
}

func (i *Integration) Developer() UserID {
	return i.developer
}

func (i *Integration) SetDeveloper(developer UserID) {
	i.developer = developer
}

func (i *Integration) Webhooks() []*Webhook {
	return i.webhooks
}

func (i *Integration) Webhook(wId WebhookID) (*Webhook, bool) {
	return lo.Find(i.webhooks, func(w *Webhook) bool { return w.id == wId })
}

func (i *Integration) AddWebhook(w *Webhook) {
	if w == nil {
		return
	}
	i.webhooks = append(i.webhooks, w)
}

func (i *Integration) UpdateWebhook(wId WebhookID, w *Webhook) bool {
	if w == nil {
		return false
	}
	_, idx, ok := lo.FindIndexOf(i.webhooks, func(w *Webhook) bool { return w.id == wId })
	if !ok || idx >= len(i.webhooks) {
		return false
	}
	i.webhooks[idx] = w
	return true
}

func (i *Integration) DeleteWebhook(wId WebhookID) bool {
	_, idx, ok := lo.FindIndexOf(i.webhooks, func(w *Webhook) bool { return w.id == wId })
	if !ok || idx >= len(i.webhooks) {
		return false
	}
	i.webhooks = slices.Delete(i.webhooks, idx, idx+1)
	return true
}

func (i *Integration) SetWebhook(webhook []*Webhook) {
	i.webhooks = webhook
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
		webhooks:    util.Map(i.webhooks, func(w *Webhook) *Webhook { return w.Clone() }),
		updatedAt:   i.updatedAt,
	}
}
