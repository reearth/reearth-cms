package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"go.mongodb.org/mongo-driver/mongo"
)

func New(ctx context.Context, mc *mongo.Client, databaseName string) (*repo.Container, error) {
	if databaseName == "" {
		databaseName = "reearth_cms"
	}
	lock, err := NewLock(mc.Database(databaseName).Collection("locks"))
	if err != nil {
		return nil, err
	}

	client := mongodoc.NewClient(databaseName, mc)
	c := &repo.Container{
		Workspace:   NewWorkspace(client),
		User:        NewUser(client),
		Transaction: NewTransaction(client),
		Lock:        lock,
		Project:     NewProject(client),
	}
	return c, nil
}

func applyWorkspaceFilter(filter interface{}, ids id.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongodoc.And(filter, "workspace", bson.M{"$in": ids.Strings()})
}
