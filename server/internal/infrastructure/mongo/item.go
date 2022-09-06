package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
)

type itemRepo struct {
	client *mongogit.Collection
}

func NewItem(client *mongox.Client) repo.Item {
	return &itemRepo{client: mongogit.NewCollection(client.WithCollection("item"))}
}

func (i itemRepo) FindByIDs(ctx context.Context, ids id.ItemIDList) ([]*item.Item, error) {
	c := &mongox.SliceConsumer[mongodoc.ItemDocument]{}
	if err := i.client.FindOne(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}, version.All(), c); err != nil {
		return nil, err
	}
	var res []*item.Item
	for _, r := range c.Result {
		it, err := r.Model()
		if err != nil {
			return nil, err
		}
		res = append(res, it)
	}
	return res, nil
}

func (i itemRepo) FindByID(ctx context.Context, id id.ItemID) (*item.Item, error) {
	c := &mongox.SliceConsumer[mongodoc.ItemDocument]{}
	if err := i.client.FindOne(ctx, bson.M{
		"id": id.String(),
	}, version.All(), c); err != nil {
		return nil, err
	}

	return c.Result[0].Model()
}

func (i itemRepo) Save(ctx context.Context, item *item.Item) error {
	doc, id := mongodoc.NewItem(item)
	return i.client.SaveOne(ctx, id, doc, nil)
}

func (i itemRepo) Remove(ctx context.Context, id id.ItemID) error {
	return i.client.RemoveOne(ctx, id.String())
}

func (i itemRepo) Archive(ctx context.Context, id id.ItemID, b bool) error {
	return i.client.ArchiveOne(ctx, id.String(), b)
}
