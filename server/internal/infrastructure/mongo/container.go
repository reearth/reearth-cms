package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	mongodoc "github.com/reearth/reearthx/mongox"
)

func InitRepos(ctx context.Context, c *repo.Container, mc *mongo.Client, databaseName string) error {
	if databaseName == "" {
		databaseName = "reearth_cms"
	}
	lock, err := NewLock(mc.Database(databaseName).Collection("locks"))
	if err != nil {
		return err
	}

	client := mongodoc.NewClient(databaseName, mc)
	c.Workspace = NewWorkspace(client)
	c.User = NewUser(client)
	c.Transaction = NewTransaction(client)
	c.Lock = lock
	c.Project = NewProject(client)
	return nil
}

func applyWorkspaceFilter(filter interface{}, ids id.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongodoc.And(filter, "workspace", bson.M{"$in": ids.Strings()})
}
