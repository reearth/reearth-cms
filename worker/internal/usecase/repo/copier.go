package repo

import (
	"context"

	"github.com/reearth/reearth-cms/shared/task"
	"go.mongodb.org/mongo-driver/bson"
)

type Copier interface {
	Copy(context.Context, bson.M, task.Changes) error
}
