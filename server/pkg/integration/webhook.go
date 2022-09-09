package integration

import (
	"net/url"
	"time"
)

type Webhook struct {
	id        WebhookID
	name      string
	url       *url.URL
	active    bool
	trigger   WebhookTrigger
	updatedAt time.Time
}

type WebhookTrigger struct {
	OnItemCreate    bool
	OnItemUpdate    bool
	OnItemDelete    bool
	OnAssetUpload   bool
	OnAssetDeleted  bool
	OnItemPublish   bool
	OnItemUnPublish bool
}

func (w *Webhook) ID() WebhookID {
	return w.id
}

func (w *Webhook) Name() string {
	return w.name
}

func (w *Webhook) SetName(name string) {
	w.name = name
}

func (w *Webhook) Url() *url.URL {
	return w.url
}

func (w *Webhook) SetUrl(url *url.URL) {
	w.url = url
}

func (w *Webhook) Active() bool {
	return w.active
}

func (w *Webhook) SetActive(active bool) {
	w.active = active
}

func (w *Webhook) Trigger() WebhookTrigger {
	return w.trigger
}

func (w *Webhook) SetTrigger(trigger WebhookTrigger) {
	w.trigger = trigger
}

func (w *Webhook) UpdatedAt() time.Time {
	if w.updatedAt.IsZero() {
		return w.id.Timestamp()
	}
	return w.updatedAt
}

func (w *Webhook) SetUpdatedAt(updatedAt time.Time) {
	w.updatedAt = updatedAt
}

func (w *Webhook) CreatedAt() time.Time {
	return w.id.Timestamp()
}

func (w *Webhook) Clone() *Webhook {
	if w == nil {
		return nil
	}

	var u *url.URL = nil
	if w.url != nil {
		u, _ = url.Parse(w.url.String())
	}
	return &Webhook{
		id:        w.id.Clone(),
		name:      w.name,
		url:       u,
		active:    w.active,
		trigger:   w.trigger,
		updatedAt: w.updatedAt,
	}
}
