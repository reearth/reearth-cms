package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/worker/pkg/webhook"
	"github.com/reearth/reearthx/log"
)

func (u *Usecase) SendWebhook(ctx context.Context, w *webhook.Webhook) error {
	eid := w.EventID
	found, err := u.webhook.Get(ctx, eid)
	if err != nil {
		log.Errorf("webhook usecase: failed to get webhook sent: %v", err)
	}
	if found {
		return nil
	}

	if err := webhook.Send(ctx, w); err != nil {
		return err
	}

	if err := u.webhook.Set(ctx, eid); err != nil {
		log.Errorf("webhook usecase: failed to set webhook sent: %v", err)
	}
	return nil
}
