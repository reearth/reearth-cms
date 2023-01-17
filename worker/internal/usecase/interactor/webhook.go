package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/worker/pkg/webhook"
	"github.com/reearth/reearthx/log"
)

func (u *Usecase) SendWebhook(ctx context.Context, w *webhook.Webhook) error {
	eid := w.EventID
	found, err := u.webhook.GetOrSet(ctx, eid)
	if err != nil {
		log.Errorf("webhook usecase: failed to get webhook sent: %v", err)
	}
	if found {
		return nil
	}

	log.Infof("webhook usecase: process: %+v", w)

	if err := webhook.Send(ctx, w); err != nil {
		if err2 := u.webhook.Delete(ctx, eid); err2 != nil {
			log.Errorf("webhook usecase: failed to set webhook sent: %v", err2)
		}
		return err
	}

	return nil
}
