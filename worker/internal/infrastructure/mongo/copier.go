package mongo

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var _ repo.Copier = (*Copier)(nil)

type Copier struct {
	c *mongo.Collection
}

func NewCopier(_ *mongo.Database) *Copier {
	return &Copier{}
}

func (r *Copier) SetCollection(collection *mongo.Collection) {
	r.c = collection
}

func (r *Copier) Init() error {
	if r.c == nil || r.c.Name() == "" {
		return rerror.ErrInternalBy(errors.New("collection is empty"))
	}
	return r.InitIndex(
		context.Background(),
	)
}

func (r *Copier) InitIndex(ctx context.Context) error {
	if r.c == nil || r.c.Name() == "" {
		return rerror.ErrInternalBy(errors.New("collection is empty"))
	}
	indexes, err := r.c.Indexes().List(ctx)
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
		if d.Name == r.c.Name() {
			return nil
		}
	}

	_, err = r.c.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: r.c.Name(), Value: 1},
		},
		Options: options.Index().SetName(r.c.Name()).SetExpireAfterSeconds(int32((time.Hour * 24).Seconds())),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	log.Infof("worker mongo: Copier index created")
	return nil
}

func (r *Copier) Copy(ctx context.Context, filter string, changes string) error {
	if r.c == nil || r.c.Name() == "" {
		return rerror.ErrInternalBy(errors.New("collection is empty"))
	}

	var f bson.M
	if err := json.Unmarshal([]byte(filter), &f); err != nil {
		return rerror.ErrInternalBy(err)
	}

	var changesMap task.Changes
	if err := json.Unmarshal([]byte(changes), &changesMap); err != nil {
		return rerror.ErrInternalBy(err)
	}

	cursor, err := r.c.Find(ctx, f)
	if errors.Is(err, mongo.ErrNilDocument) || errors.Is(err, mongo.ErrNoDocuments) {
		return rerror.ErrNotFound
	}
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	defer cursor.Close(ctx)

	var bulkModels []mongo.WriteModel
	for cursor.Next(ctx) {
		if err := cursor.Err(); err != nil {
			return rerror.ErrInternalBy(err)
		}

		var result bson.M
		if err := cursor.Decode(&result); err != nil {
			return rerror.ErrInternalBy(err)
		}

		for k, change := range changesMap {
			switch change.Type {
			case task.ChangeTypeNew:
				newId, _ := generateId(change.Value)
				result[k] = newId
			case task.ChangeTypeSet:
				result[k] = change.Value
			}
		}

		bulkModels = append(bulkModels, mongo.NewInsertOneModel().SetDocument(result))
	}

	if err := cursor.Close(ctx); err != nil {
		return rerror.ErrInternalBy(err)
	}

	if len(bulkModels) > 0 {
		_, err = r.c.BulkWrite(ctx, bulkModels)
		if err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	return nil
}

func generateId(t string) (string, bool) {
	switch t {
	case "item":
		return id.NewAssetID().String(), true
	case "schema":
		return id.NewSchemaID().String(), true
	case "model":
		return id.NewModelID().String(), true
	default:
		return "", false
	}
}
