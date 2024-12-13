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

var _ repo.Schema = (*Schema)(nil)

type Schema struct {
	c *mongo.Collection
}

func NewSchema(db *mongo.Database) *Schema {
	return &Schema{
		c: db.Collection("schema"),
	}
}

func (r *Schema) Init() error {
	return r.InitIndex(
		context.Background(),
	)
}

func (w *Schema) InitIndex(ctx context.Context) error {
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
		if d.Name == "schema" {
			return nil
		}
	}

	_, err = w.c.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "schema", Value: 1},
		},
		Options: options.Index().SetName("schema").SetExpireAfterSeconds(int32((time.Hour * 24).Seconds())),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	log.Infof("worker mongo: schema index created")
	return nil
}

func (w *Schema) FindByID(context.Context, id.SchemaID) (*interface{}, error) {
	panic("not implemented")
}

func (w *Schema) Save(context.Context, *interface{}) error {
	panic("not implemented")
}
