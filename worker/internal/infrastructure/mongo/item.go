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

var _ repo.Item = (*Item)(nil)

type Item struct {
	c *mongo.Collection
}

func NewItem(db *mongo.Database) *Item {
	return &Item{
		c: db.Collection("item"),
	}
}

func (r *Item) Init() error {
	return r.InitIndex(
		context.Background(),
	)
}

func (w *Item) InitIndex(ctx context.Context) error {
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
		if d.Name == "item" {
			return nil
		}
	}

	_, err = w.c.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "item", Value: 1},
		},
		Options: options.Index().SetName("item").SetExpireAfterSeconds(int32((time.Hour * 24).Seconds())),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	log.Infof("worker mongo: item index created")
	return nil
}

func (w *Item) FindBySchema(ctx context.Context, schemaId id.SchemaID) ([]interface{}, error) {
	cursor, err := w.c.Find(ctx, bson.M{
		"schema": schemaId.String(),
	})
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	docs := make([]interface{}, len(results))
	for i, v := range results {
		docs[i] = v
	}

	return docs, nil
}

func (w *Item) SaveAll(ctx context.Context, items []interface{}) error {
	if len(items) == 0 {
		return nil
	}

	_, err := w.c.InsertMany(ctx, items)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}
