package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
)

type Item struct {
	client *mongogit.Collection
	f      repo.ProjectFilter
}

func NewItem(client *mongox.Client) repo.Item {
	r := &Item{client: mongogit.NewCollection(client.WithCollection("item"))}
	r.init()
	return r
}

func (r *Item) Filtered(f repo.ProjectFilter) repo.Item {
	return &Item{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Item) init() {
	err := r.client.CreateIndexes(context.Background(), []string{"schema", "fields.schemafield"}, nil)
	if err != nil {
		log.Infof("mongo: %s: index created: %s", "item", err)
	}
}

func (r *Item) FindByID(ctx context.Context, id id.ItemID) (*item.Item, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, pagination *usecasex.Pagination) (item.List, *usecasex.PageInfo, error) {
	return r.paginate(ctx, bson.M{
		"schema": schemaID.String(),
	}, pagination)
}

func (r *Item) FindByProject(ctx context.Context, projectID id.ProjectID, pagination *usecasex.Pagination) (item.List, *usecasex.PageInfo, error) {
	if !r.f.CanRead(projectID) {
		return nil, usecasex.EmptyPageInfo(), repo.ErrOperationDenied
	}
	return r.paginate(ctx, bson.M{
		"project": projectID.String(),
	}, pagination)
}

func (r *Item) FindByIDs(ctx context.Context, ids id.ItemIDList) (item.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter)
	if err != nil {
		return nil, err
	}

	return filterItems(ids, res), nil
}

func (r *Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID) ([]*version.Value[*item.Item], error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(bson.M{
		"id": itemID.String(),
	}), version.All(), c); err != nil {
		return nil, err
	}

	return c.Result, nil
}

func (r *Item) IsArchived(ctx context.Context, id id.ItemID) (bool, error) {
	return r.client.IsArchived(ctx, r.readFilter(bson.M{"id": id.String()}))
}

func (r *Item) Save(ctx context.Context, item *item.Item) error {
	if !r.f.CanWrite(item.Project()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewItem(item)
	return r.client.SaveOne(ctx, id, doc, nil)
}

func (r *Item) Remove(ctx context.Context, id id.ItemID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": id.String()}))
}

func (r *Item) Archive(ctx context.Context, id id.ItemID, pid id.ProjectID, b bool) error {
	if !r.f.CanWrite(pid) {
		return repo.ErrOperationDenied
	}
	return r.client.ArchiveOne(ctx, bson.M{
		"id":      id.String(),
		"project": pid.String(),
	}, b)
}

func (r *Item) paginate(ctx context.Context, filter bson.M, pagination *usecasex.Pagination) (item.List, *usecasex.PageInfo, error) {
	c := mongodoc.NewItemConsumer()
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), version.Eq(version.Latest.OrVersion()), pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Result, pageInfo, nil
}

func (r *Item) find(ctx context.Context, filter interface{}) (item.List, error) {
	c := mongodoc.NewItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), version.Eq(version.Latest.OrVersion()), c); err != nil {
		return nil, err
	}

	return c.Result, nil
}

func (r *Item) findOne(ctx context.Context, filter interface{}) (*item.Item, error) {
	c := mongodoc.NewItemConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), version.Eq(version.Latest.OrVersion()), c); err != nil {
		return nil, err
	}

	return c.Result[0], nil
}

func filterItems(ids []id.ItemID, rows item.List) item.List {
	res := make(item.List, 0, len(ids))
	for _, id := range ids {
		for _, r := range rows {
			if r.ID() == id {
				res = append(res, r)
				break
			}
		}
	}
	return res
}

func (r *Item) readFilter(filter interface{}) interface{} {
	return applyProjectFilter(filter, r.f.Readable)
}

func (r *Item) writeFilter(filter interface{}) interface{} {
	return applyProjectFilter(filter, r.f.Writable)
}
