package mongo

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
)

func New(ctx context.Context, webhook *Webhook, copier *Copier) (*repo.Container, error) {
	r := &repo.Container{
		Webhook: webhook,
		Copier:  copier,
	}

	// init
	if err := Init(r); err != nil {
		return nil, err
	}

	return r, nil
}

func Init(r *repo.Container) error {
	if r == nil {
		return nil
	}

	if r.Webhook == nil && r.Copier == nil {
		return errors.New("invalid repository container")
	}

	return nil
}
