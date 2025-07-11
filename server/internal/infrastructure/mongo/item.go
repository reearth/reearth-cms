package mongo

import (
	"context"
	"encoding/json"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

var (
	itemIndexes = []string{
		"assets",
		"modelid",
		"project",
		"schema",
		"fields.f",
		"fields.v.t",
		"fields.v.v",
		"project,schema,!timestamp,!id,__r",
		"project,__r,modelid,schema,__",
		"modelid,id,__r",
		"modelid,!_id,__r",
		//"__r,assets,project,__", // mongo cannot index parallel arrays [assets] [__r]
		"__r,project,__",
		"__r,asset,project,__",
		"schema,id,__r,project",
	}
)

type Item struct {
	client *mongogit.Collection
	f      repo.ProjectFilter
}

func NewItem(client *mongox.Client) repo.Item {
	return &Item{client: mongogit.NewCollection(client.WithCollection("item"))}
}

func (r *Item) Filtered(f repo.ProjectFilter) repo.Item {
	return &Item{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *Item) Init() error {
	return createIndexes2(
		context.Background(),
		r.client.Client(),
		append(
			r.client.Indexes(),
			mongox.IndexFromKeys(itemIndexes, false)...,
		)...,
	)
}

func (r *Item) FindByID(ctx context.Context, id id.ItemID, ref *version.Ref) (item.Versioned, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	}, ref)
}

func (r *Item) FindByIDs(ctx context.Context, ids id.ItemIDList, ref *version.Ref) (item.VersionedList, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	res, err := r.find(ctx, filter, ref)
	if err != nil {
		return nil, err
	}

	return filterItems(ids, res), nil
}

func (r *Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	res, pi, err := r.paginate(ctx, bson.M{
		"schema": schemaID.String(),
	}, ref, sort, pagination)
	return res, pi, err
}

func (r *Item) FindByModel(ctx context.Context, modelID id.ModelID, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	res, pi, err := r.paginate(ctx, bson.M{
		"modelid": modelID.String(),
	}, ref, sort, pagination)
	return res, pi, err
}

func (r *Item) FindByModelAndValue(ctx context.Context, modelID id.ModelID, fields []repo.FieldAndValue, ref *version.Ref) (item.VersionedList, error) {
	filters := make([]bson.M, 0, len(fields))
	for _, f := range fields {
		v := mongodoc.NewMultipleValue(f.Value)
		if v == nil {
			continue
		}

		filters = append(
			filters,
			bson.M{
				"modelid": modelID.String(),
				"fields": bson.M{
					"$elemMatch": bson.M{
						"f":   f.Field.String(),
						"v.t": v.T,
						"v.v": v.V,
					},
				},
			},
			// compat
			bson.M{
				"modelid": modelID.String(),
				"fields": bson.M{
					"$elemMatch": bson.M{
						"schemafield": f.Field.String(),
						"valuetype":   v.T,
						"value":       v.V,
					},
				},
			},
		)
	}

	if len(filters) == 0 {
		return nil, nil
	}
	return r.find(ctx, bson.M{"$or": filters}, ref)
}

func (r *Item) CountByModel(ctx context.Context, modelID id.ModelID) (int, error) {
	count, err := r.client.Count(ctx, r.readFilter(bson.M{
		"modelid": modelID.String(),
	}), version.Eq(version.Latest.OrVersion()))
	return int(count), err
}

func (r *Item) FindByAssets(ctx context.Context, al id.AssetIDList, ref *version.Ref) (item.VersionedList, error) {
	if al.Len() == 0 {
		return nil, nil
	}

	return r.aggregate(ctx, []any{bson.M{"$match": bson.M{"assets": bson.M{"$in": al.Strings()}}}}, ref)
}

func (r *Item) FindVersionByID(ctx context.Context, itemID id.ItemID, ver version.VersionOrRef) (item.Versioned, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(bson.M{
		"id": itemID.String(),
	}), version.Eq(ver), c); err != nil {
		return nil, err
	}

	return c.Result[0], nil
}

func (r *Item) FindAllVersionsByID(ctx context.Context, itemID id.ItemID) (item.VersionedList, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(bson.M{
		"id": itemID.String(),
	}), version.All(), c); err != nil {
		return nil, err
	}

	return c.Result, nil
}

func (r *Item) FindAllVersionsByIDs(ctx context.Context, ids id.ItemIDList) (item.VersionedList, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}), version.All(), c); err != nil {
		return nil, err
	}

	return item.VersionedList(c.Result), nil
}

func (r *Item) LastModifiedByModel(ctx context.Context, modelID id.ModelID) (time.Time, error) {
	return r.client.Timestamp(ctx, bson.M{
		"modelid": modelID.String(),
	}, version.Eq(version.Latest.OrVersion()))
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

func (r *Item) SaveAll(ctx context.Context, items item.List) error {
	if len(items) == 0 {
		return nil
	}

	for _, itm := range items {
		if !r.f.CanWrite(itm.Project()) {
			return repo.ErrOperationDenied
		}
	}
	docs, ids := mongodoc.NewItems(items)
	return r.client.SaveMany(ctx, ids, lo.ToAnySlice(docs))
}

func (r *Item) UpdateRef(ctx context.Context, item id.ItemID, ref version.Ref, vr *version.VersionOrRef) error {
	return r.client.UpdateRef(ctx, item.String(), ref, vr)
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

func (r *Item) paginate(ctx context.Context, filter bson.M, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	c := mongodoc.NewVersionedItemConsumer()
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), sort, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Result, pageInfo, nil
}

func (r *Item) paginateAggregation(ctx context.Context, pipeline []any, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	c := mongodoc.NewVersionedItemConsumer()
	pageInfo, err := r.client.PaginateAggregation(ctx, applyProjectFilterToPipeline(pipeline, r.f.Readable), version.Eq(ref.OrLatest().OrVersion()), sort, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Result, pageInfo, nil
}

func (r *Item) find(ctx context.Context, filter any, ref *version.Ref) (item.VersionedList, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Item) aggregate(ctx context.Context, pipeline []any, ref *version.Ref) (item.VersionedList, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Aggregate(ctx, applyProjectFilterToPipeline(pipeline, r.f.Readable), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *Item) findOne(ctx context.Context, filter any, ref *version.Ref) (item.Versioned, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *Item) Copy(ctx context.Context, params repo.CopyParams) (*string, *string, error) {
	filter, err := json.Marshal(bson.M{"schema": params.OldSchema.String(), "__r": bson.M{"$in": []string{"latest"}}})
	if err != nil {
		return nil, nil, err
	}

	c := task.Changes{
		"id": {
			Type:  task.ChangeTypeULID,
			Value: params.Timestamp.UnixMilli(),
		},
		"schema": {
			Type:  task.ChangeTypeSet,
			Value: params.NewSchema.String(),
		},
		"modelid": {
			Type:  task.ChangeTypeSet,
			Value: params.NewModel.String(),
		},
		"timestamp": {
			Type:  task.ChangeTypeSet,
			Value: params.Timestamp.UTC().Format("2006-01-02T15:04:05.000+00:00"), //TODO: should use a better way to format
		},
		"updatedbyuser": {
			Type:  task.ChangeTypeSet,
			Value: nil,
		},
		"updatedbyintegration": {
			Type:  task.ChangeTypeSet,
			Value: nil,
		},
		"originalitem": {
			Type:  task.ChangeTypeULID,
			Value: params.Timestamp.UnixMilli(),
		},
		"metadataitem": {
			Type:  task.ChangeTypeULID,
			Value: params.Timestamp.UnixMilli(),
		},
		"thread": {
			Type:  task.ChangeTypeSet,
			Value: nil,
		},
		"__r": { // tag
			Type:  task.ChangeTypeSet,
			Value: []string{"latest"},
		},
		"__w": { // parent
			Type:  task.ChangeTypeSet,
			Value: nil,
		},
		"__v": { // version
			Type:  task.ChangeTypeNew,
			Value: "version",
		},
	}
	if params.User != nil {
		c["user"] = task.Change{
			Type:  task.ChangeTypeSet,
			Value: *params.User,
		}
	}
	if params.Integration != nil {
		c["integration"] = task.Change{
			Type:  task.ChangeTypeSet,
			Value: *params.Integration,
		}
	}
	changes, err := json.Marshal(c)
	if err != nil {
		return nil, nil, err
	}

	return lo.ToPtr(string(filter)), lo.ToPtr(string(changes)), nil
}

func filterItems(ids []id.ItemID, rows item.VersionedList) item.VersionedList {
	res := make(item.VersionedList, 0, len(ids))
	for _, id := range ids {
		for _, r := range rows {
			if r.Value().ID() == id {
				res = append(res, r)
				break
			}
		}
	}
	return res
}

func (r *Item) readFilter(filter any) any {
	return applyProjectFilter(filter, r.f.Readable)
}

func (r *Item) writeFilter(filter any) any {
	return applyProjectFilter(filter, r.f.Writable)
}
