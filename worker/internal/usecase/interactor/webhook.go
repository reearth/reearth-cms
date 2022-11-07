package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/worker/pkg/webhook"
)

func (u *Usecase) SendWebhook(ctx context.Context, w *webhook.Webhook) error {
	return webhook.Send(ctx, w)
}
