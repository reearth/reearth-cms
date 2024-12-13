package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/util"
	"go.mongodb.org/mongo-driver/mongo"
)

func New(ctx context.Context, db *mongo.Database) (*repo.Container, error) {
	c := &repo.Container{
		Webhook: NewWebhook(db),
		Model:   NewModel(db),
		Schema:  NewSchema(db),
		Item:    NewItem(db),
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
		r.Model.(*Model).Init,
		r.Schema.(*Schema).Init,
		r.Item.(*Item).Init,
	)
}
