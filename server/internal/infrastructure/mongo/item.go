package mongo

import (
	"context"
	"fmt"
	"regexp"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongogit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	itemIndexes = []string{
		"assets",
		"modelid",
		"project",
		"schema",
		"fields.schemafield",
		"project,schema,!timestamp,!id,__r",
		"modelid,id,__r",
		// "__r,assets,project,__", // cannot index parallel arrays
		"__r,project,__",
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

func (r *Item) FindByModel(ctx context.Context, modelID id.ModelID, ref *version.Ref, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	res, pi, err := r.paginate(ctx, bson.M{
		"modelid": modelID.String(),
	}, ref, nil, pagination)
	return res, pi, err
}

func (r *Item) FindByProject(ctx context.Context, projectID id.ProjectID, ref *version.Ref, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if !r.f.CanRead(projectID) {
		return nil, usecasex.EmptyPageInfo(), repo.ErrOperationDenied
	}
	res, pi, err := r.paginate(ctx, bson.M{
		"project": projectID.String(),
	}, ref, nil, pagination)
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

func (r *Item) FindByAssets(ctx context.Context, al id.AssetIDList, ref *version.Ref) (item.VersionedList, error) {
	if al.Len() == 0 {
		return nil, nil
	}

	filters := make([]bson.M, 0, len(al)+1)
	filters = append(filters, bson.M{
		"assets": bson.M{"$in": al.Strings()},
	})

	// compat
	for _, assetID := range al {
		filters = append(filters,
			bson.M{
				"fields": bson.M{
					"$elemMatch": bson.M{
						"v.t": "asset",
						"v.v": assetID.String(),
					},
				},
			},
			bson.M{
				"fields": bson.M{
					"$elemMatch": bson.M{
						"valuetype": "asset",
						"value":     assetID.String(),
					},
				},
			})
	}

	return r.find(ctx, bson.M{"$or": filters}, ref)
}

func (i *Item) Search(ctx context.Context, query *item.Query, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	filter := bson.M{
		"project": query.Project().String(),
	}
	if query.Q() != "" {
		regex := primitive.Regex{Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(query.Q())), Options: "i"}
		filter["$or"] = []bson.M{
			{"fields.v.v": bson.M{"$regex": regex}},
			{"fields.value": bson.M{"$regex": regex}}, // compat
		}

	}
	if query.Schema() != nil {
		filter["schema"] = query.Schema().String()
	}
	res, pi, err := i.paginate(ctx, filter, query.Ref(), sort, pagination)
	return res, pi, err
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
	if len(c.Result) > 0 {
		ml, err := r.findMeta(ctx, nil, lo.ToPtr(c.Result[0].Value().Project()))
		if err != nil {
			return nil, nil, err
		}
		return filterArchived(ml, c.Result), pageInfo, nil
	}
	return c.Result, pageInfo, nil
}

func (r *Item) find(ctx context.Context, filter any, ref *version.Ref) (item.VersionedList, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}

	if len(c.Result) > 0 {
		ml, err := r.findMeta(ctx, nil, lo.ToPtr(c.Result[0].Value().Project()))
		if err != nil {
			return nil, err
		}
		return filterArchived(ml, c.Result), nil
	}
	return c.Result, nil
}

func (r *Item) findOne(ctx context.Context, filter any, ref *version.Ref) (item.Versioned, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}

	iid := c.Result[0].Value().ID()
	ml, err := r.findMeta(ctx, id.ItemIDList{iid}, nil)
	if err != nil {
		return nil, err
	}
	res := filterArchived(ml, c.Result)
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Item) findMeta(ctx context.Context, ids id.ItemIDList, pid *id.ProjectID) ([]mongodoc.ItemMetaDocument, error) {
	filter := bson.M{}
	if len(ids) > 0 {
		filter["id"] = bson.M{
			"$in": ids.Strings(),
		}
	}
	if pid != nil {
		filter["project"] = pid.String()
	}
	c := mongox.SliceConsumer[mongodoc.ItemMetaDocument]{}
	if err := r.client.FindMeta(ctx, filter, &c); err != nil {
		return nil, err
	}
	return c.Result, nil
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

func filterArchived(ids []mongodoc.ItemMetaDocument, rows item.VersionedList) item.VersionedList {
	res := util.Filter(rows, func(versioned item.Versioned) bool {
		_, b := lo.Find(ids, func(document mongodoc.ItemMetaDocument) bool {
			return versioned.Value().ID().String() == document.ID && document.Archived
		})
		return !b
	})
	return res
}

func (r *Item) readFilter(filter any) any {
	return applyProjectFilter(filter, r.f.Readable)
}

func (r *Item) writeFilter(filter any) any {
	return applyProjectFilter(filter, r.f.Writable)
}
