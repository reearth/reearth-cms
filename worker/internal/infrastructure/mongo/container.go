package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/util"
)

func New(ctx context.Context, webhook *Webhook, copier *Copier) (*repo.Container, error) {
	c := &repo.Container{
		Webhook: webhook,
		Copier:  copier,
	}

	// init
	if err := Init(c); err != nil {
		return nil, err
	}

	return c, nil
}

func Init(r *repo.Container) error {
	if r == nil {
		return nil
	}

	return util.Try(
		r.Webhook.(*Webhook).Init,
		r.Copier.(*Copier).Init,
	)
}
