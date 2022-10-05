package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
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

	client := mongox.NewClient(databaseName, mc)
	c := &repo.Container{
		Asset:       NewAsset(client),
		Workspace:   NewWorkspace(client),
		User:        NewUser(client),
		Transaction: mongox.NewTransaction(client),
		Lock:        lock,
		Project:     NewProject(client),
		Item:        NewItem(client),
		Model:       NewModel(client),
		Schema:      NewSchema(client),
		Thread:      NewThread(client),
		Integration: NewIntegration(client),
	}
	return c, nil
}

func applyWorkspaceFilter(filter interface{}, ids id.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "workspace", bson.M{"$in": ids.Strings()})
}
