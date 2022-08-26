package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/log"
	"go.mongodb.org/mongo-driver/bson"
)

type itemRepo struct {
	client *mongodoc.ClientCollection
}

func NewItem(client *mongodoc.Client) repo.Item {
	r := &itemRepo{client: client.WithCollection("item")}
	r.init()
	return r
}

func (r *itemRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil)
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "item", i)
	}
}

func (r *itemRepo) FindByModel(ctx context.Context, id id.ModelID) (item.List, error) {
	filter := bson.M{
		"schemamodel": id.String(),
	}
	return r.find(ctx, nil, filter)
}

func (r *itemRepo) FindByIDs(ctx context.Context, list id.ItemIDList) (item.List, error) {
	if len(list) == 0 {
		return nil, nil
	}
	dst := make([]*item.Item, 0, len(list))
	res, err := r.find(ctx, dst, bson.M{
		"id": bson.M{"$in": list.Strings()},
	})
	if err != nil {
		return nil, err
	}
	return filterItems(list, res), nil
}

func (r *itemRepo) FindByID(ctx context.Context, id id.ItemID) (*item.Item, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *itemRepo) Save(ctx context.Context, item *item.Item) error {
	doc, id := mongodoc.NewItem(item)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *itemRepo) SaveAll(ctx context.Context, items item.List) error {
	if len(items) == 0 {
		return nil
	}
	docs, ids := mongodoc.NewItems(items)
	docs2 := make([]interface{}, 0, len(items))
	for _, d := range docs {
		docs2 = append(docs2, d)
	}
	return r.client.SaveAll(ctx, ids, docs2)
}

func (r *itemRepo) Remove(ctx context.Context, id id.ItemID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": id.String()})
}

func (r *itemRepo) RemoveAll(ctx context.Context, ids id.ItemIDList) error {
	if len(ids) == 0 {
		return nil
	}
	return r.client.RemoveAll(ctx, bson.M{
		"id": bson.M{"$in": ids.Strings()},
	})
}

func (r *itemRepo) findOne(ctx context.Context, filter interface{}) (*item.Item, error) {
	c := mongodoc.ItemConsumer{
		Rows: make(item.List, 0, 1),
	}
	if err := r.client.FindOne(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *itemRepo) find(ctx context.Context, dst item.List, filter interface{}) (item.List, error) {
	c := mongodoc.ItemConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func filterItems(list []id.ItemID, rows item.List) item.List {
	res := make(item.List, 0, len(list))
	for _, id := range list {
		var r2 *item.Item
		for _, r := range rows {
			if r.ID() == id {
				r2 = r
				break
			}
		}
		res = append(res, r2)
	}
	return res
}
