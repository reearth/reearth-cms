package mongo

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var _ repo.Model = (*Model)(nil)

type Model struct {
	c *mongo.Collection
}

func NewModel(db *mongo.Database) *Model {
	return &Model{
		c: db.Collection("model"),
	}
}

func (r *Model) Init() error {
	return r.InitIndex(
		context.Background(),
	)
}

func (w *Model) InitIndex(ctx context.Context) error {
	indexes, err := w.c.Indexes().List(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	for indexes.Next(ctx) {
		d := struct {
			Name string `bson:"name"`
		}{}
		if err := indexes.Decode(&d); err != nil {
			return rerror.ErrInternalBy(err)
		}
		if d.Name == "model" {
			return nil
		}
	}

	_, err = w.c.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "model", Value: 1},
		},
		Options: options.Index().SetName("model").SetExpireAfterSeconds(int32((time.Hour * 24).Seconds())),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	log.Infof("worker mongo: model index created")
	return nil
}

func (w *Model) FindByID(context.Context, id.ModelID) (*interface{}, error) {
	panic("not implemented")
}
