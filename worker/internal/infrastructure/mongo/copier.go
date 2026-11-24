package mongo

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/oklog/ulid/v2"
	"github.com/reearth/reearth-cms/shared/task"
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
	defer func(cursor *mongo.Cursor, ctx context.Context) {
		err := cursor.Close(ctx)
		if err != nil {
			log.Errorf("reearth-cms/worker: failed to close cursor: %v\n", err)
		}
	}(cursor, ctx)

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
			// Every change type in shared/task must be handled here.
			//exhaustive:enforce
			switch change.Type {
			case task.ChangeTypeNew:
				str, ok := change.Value.(string)
				if !ok {
					return errors.New("invalid change value")
				}
				if str == "version" {
					result[k] = uuid.New()
				} else {
					newId, ok := generateId(str)
					if !ok {
						return errors.New("invalid type")
					}
					result[k] = newId
				}
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
				val, ok := change.Value.(float64)
				if !ok {
					return errors.New("invalid millisecond value: not a float64")
				}
				if val < 0 || val != float64(uint64(val)) {
					return errors.New("invalid millisecond value: out of range or not an integer")
				}
				v := uint64(val)
				err = newId.SetTime(v)
				if err != nil {
					return rerror.ErrInternalBy(err)
				}
				result[k] = strings.ToLower(newId.String())
			case task.ChangeTypeSet:
				result[k] = change.Value
			default:
				// A newer server can send a change type this worker does not
				// know. Fail instead of copying the field unchanged, which
				// would duplicate IDs.
				err := fmt.Errorf("unknown change type %q for field %q", change.Type, k)
				log.Errorf("failed to copy: %v", err)
				return err
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
	case "item", "schema", "model":
		return newID(), true
	default:
		return "", false
	}
}

// newID returns a new ID in the server's format: a lowercase ULID.
func newID() string {
	return strings.ToLower(ulid.Make().String())
}
