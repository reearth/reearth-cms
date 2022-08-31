package integration

import (
	"net/url"
	"time"
)

type Webhook struct {
	id        ID
	name      string
	url       *url.URL
	active    bool
	event     []*WebhookEvent
	updatedAt time.Time
}

func (w *Webhook) ID() ID {
	return w.id
}

func (w *Webhook) Name() string {
	return w.name
}

func (w *Webhook) SetName(name string) {
	w.name = name
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
		event:     nil,
		updatedAt: w.updatedAt,
	}
}
