package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
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
		Integration: NewIntegration(client),
	}

	// init
	if err := Init(c); err != nil {
		return nil, err
	}

	return c, nil
}

func Init(r *repo.Container) error {
	if r == nil {
		return nil
	}

	return util.Try(
		r.Asset.(*Asset).Init,
		r.Workspace.(*Workspace).Init,
		r.User.(*User).Init,
		r.Project.(*ProjectRepo).Init,
		r.Item.(*Item).Init,
		r.Model.(*Model).Init,
		r.Schema.(*Schema).Init,
		r.Integration.(*Integration).Init,
	)
}

func createIndexes(ctx context.Context, c *mongox.ClientCollection, keys, uniqueKeys []string) error {
	created, deleted, err := c.Indexes(ctx, keys, uniqueKeys)
	if len(created) > 0 || len(deleted) > 0 {
		log.Infof("mongo: %s: index deleted: %v, created: %v\n", c.Client().Name(), deleted, created)
	}
	return err
}

func applyWorkspaceFilter(filter interface{}, ids id.WorkspaceIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "workspace", bson.M{"$in": ids.Strings()})
}

func applyProjectFilter(filter interface{}, ids id.ProjectIDList) interface{} {
	if ids == nil {
		return filter
	}
	return mongox.And(filter, "project", bson.M{"$in": ids.Strings()})
}
