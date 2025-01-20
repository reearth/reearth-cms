package mongo

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/oklog/ulid"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/worker/internal/usecase/repo"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TODO: this should be taken from config
var batchSize int32 = 1000

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

func (r *Copier) Copy(ctx context.Context, f bson.M, changesMap task.Changes) error {
	options := options.Find().SetBatchSize(batchSize)
	cursor, err := r.c.Find(ctx, f, options)
	if err != nil {
		if errors.Is(err, mongo.ErrNilDocument) || errors.Is(err, mongo.ErrNoDocuments) {
			return rerror.ErrNotFound
		}
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
		result["_id"] = primitive.NewObjectID()

		for k, change := range changesMap {
			switch change.Type {
			case task.ChangeTypeNew:
				str, ok := change.Value.(string)
				if !ok {
					return errors.New("invalid change value")
				}
				newId, ok := generateId(str)
				if !ok {
					return errors.New("invalid type")
				}
				result[k] = newId
			case task.ChangeTypeULID:
				if result[k] == nil {
					continue
				}
				u, ok := result[k].(string)
				if !ok {
					return errors.New("invalid old id")
				}
				newId, err := ulid.Parse(u)
				if err != nil {
					return rerror.ErrInternalBy(err)
				}
				v, ok := change.Value.(uint64)
				if !ok {
					return errors.New("invalid millisecond value")
				}
				err = newId.SetTime(v)
				if err != nil {
					return rerror.ErrInternalBy(err)
				}
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
	log.Infof("reearth-cms/worker: all data has been successfully copied!")

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
	case "version":
		return uuid.New().String(), true
	default:
		return "", false
	}
}
