package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
)

func New(ctx context.Context, webhook *Webhook, copier *Copier) (*repo.Container, error) {
	if webhook == nil && copier == nil {
		return nil, errors.New("invalid repository container")
	}

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
	return nil
	// if r == nil {
	// 	return nil
	// }

	// return util.Try(
	// 	r.Webhook.(*Webhook).Init,
	// 	r.Copier.(*Copier).Init,
	// )
}
