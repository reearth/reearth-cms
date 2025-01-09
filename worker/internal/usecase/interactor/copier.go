package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/task"
	"go.mongodb.org/mongo-driver/bson"
)

func (u *Usecase) Copy(ctx context.Context, filter bson.M, changes task.Changes) error {
	return u.repos.Copier.Copy(ctx, filter, changes)
}
