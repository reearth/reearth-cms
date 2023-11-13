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
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/idx"
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

func (r *Item) FindByModel(ctx context.Context, modelID id.ModelID, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	res, pi, err := r.paginate(ctx, bson.M{
		"modelid": modelID.String(),
	}, ref, sort, pagination)
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

func (r *Item) Search(ctx context.Context, sp schema.Package, query *item.Query, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	// apply basic filter like project, model, schema, keyword search
	pipeline := []any{basicFilterStage(query)}

	// if the query has any meta fields, lookup the meta item
	if query.HasMetaFields() {
		pipeline = append(pipeline, lookupStages()...)
	}

	// create aliases for fields used in filter logic or sort
	pipeline = append(pipeline, aliasStages(query, sp)...)

	// apply filters and sort to pipeline
	filterStage := filter(query.Filter(), sp)
	if filterStage != nil {
		pipeline = append(pipeline, bson.M{"$match": filterStage})
	}

	res, pi, err := r.paginateAggregation(ctx, pipeline, query.Ref(), sort(query), pagination)
	return res, pi, err
}

func sort(query *item.Query) *usecasex.Sort {
	var s *usecasex.Sort
	if query.Sort() != nil {
		reverted := query.Sort().Direction == view.DirectionDesc
		s = &usecasex.Sort{
			Key:      fieldKey(query.Sort().Field),
			Reverted: reverted,
		}
	}
	return s
}

func basicFilterStage(query *item.Query) any {
	filter := bson.M{
		"project": query.Project().String(),
		"modelid": query.Model().String(),
	}
	if query.Schema() != nil {
		filter["schema"] = query.Schema().String()
	}
	if query.Q() != "" {
		regex := primitive.Regex{Pattern: fmt.Sprintf(".*%s.*", regexp.QuoteMeta(query.Q())), Options: "i"}
		filter["$or"] = []bson.M{
			{"fields.v.v": bson.M{"$regex": regex}},
			{"fields.value": bson.M{"$regex": regex}}, // compat
		}
	}
	return bson.M{"$match": filter}
}

func lookupStages() []any {
	return []any{
		bson.M{
			"$lookup": bson.M{
				"from":         "item",
				"localField":   "metadataitem",
				"foreignField": "id",
				"as":           "__temp.meta",
				"pipeline": []bson.M{
					{
						"$match": bson.M{
							"__":  bson.M{"$exists": false},
							"__r": bson.M{"$in": bson.A{"latest"}},
						},
					},
				},
			},
		},
		bson.M{
			"$unwind": "$__temp.meta",
		},
	}
}

func aliasStages(query *item.Query, sp schema.Package) []any {
	aliases := bson.M{}
	for _, field := range query.ItemFields() {
		aliases["__temp."+field.ID.String()] = bson.M{
			"$map": bson.M{
				"input": bson.M{
					"$filter": bson.M{
						"input": "$fields",
						"as":    "field",
						"cond":  bson.M{"$eq": bson.A{"$$field.f", field.ID.String()}},
					},
				},
				"as": "field",
				"in": "$$field.v.v",
			},
		}
	}
	for _, field := range query.MetaFields() {
		aliases["__temp."+field.ID.String()] = bson.M{
			"$map": bson.M{
				"input": bson.M{
					"$filter": bson.M{
						"input": "$__temp.meta.fields",
						"as":    "field",
						"cond":  bson.M{"$eq": bson.A{"$$field.f", field.ID.String()}},
					},
				},
				"as": "field",
				"in": "$$field.v.v",
			},
		}
	}

	basicAliases := bson.M{
		"__temp.createdBy": bson.M{"$ifNull": bson.A{"$user", "$integration"}},
		// "__temp.createdAt": bson.M{
		// 	"$function": bson.M{
		// 		"body": "function(ulid) { const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', ENCODING_LEN = ENCODING.length, TIME_LEN = 10; return new Date( ulid.substr(0, TIME_LEN).toUpperCase().split('').reverse().reduce((carry, char, index) => (carry += ENCODING.indexOf(char) * Math.pow(ENCODING_LEN, index)), 0)); }",
		// 		"args": bson.A{"$id"},
		// 		"lang": "js",
		// 	},
		// },
		"__temp.createdAt": "$timestamp",
		"__temp.updatedBy": bson.M{"$ifNull": bson.A{"$updatedbyuser", "$updatedbyintegration"}},
		"__temp.updatedAt": "$timestamp",
	}

	stages := []any{
		bson.M{"$set": lo.Assign(aliases, basicAliases)},
		bson.M{"$set": bson.M{
			"__temp.createdAt": resetTime("$__temp.createdAt"),
			"__temp.updatedAt": resetTime("$__temp.updatedAt"),
		}},
	}

	if len(aliases) <= 0 {
		return stages
	}

	// unwind the aliases: will get the field value in side an array
	for key := range aliases {
		stages = append(stages, bson.M{"$unwind": bson.M{"path": "$" + key, "preserveNullAndEmptyArrays": true}})
	}

	// parse dates and reset time part of the dates included in the filter
	resetTimeAliases := bson.M{}
	for _, fs := range query.Fields() {
		if fs.ID == nil {
			continue
		}
		f := sp.Field(*fs.ID)
		if f != nil && f.Type() == value.TypeDateTime {
			resetTimeAliases["__temp."+fs.ID.String()] = bson.M{
				"$map": bson.M{
					"input": "$__temp." + fs.ID.String(),
					"as":    "date",
					"in":    resetTime("$$date"),
				},
			}
		}
	}
	stages = append(stages, bson.M{"$set": resetTimeAliases})

	return stages
}

func resetTime(dateField string) bson.M {
	return bson.M{
		"$dateFromParts": bson.M{
			"year":        bson.M{"$year": bson.M{"$toDate": dateField}},
			"month":       bson.M{"$month": bson.M{"$toDate": dateField}},
			"day":         bson.M{"$dayOfMonth": bson.M{"$toDate": dateField}},
			"hour":        0,
			"minute":      0,
			"second":      0,
			"millisecond": 0,
		},
	}
}

func filter(c *view.Condition, sp schema.Package) any {
	if c == nil {
		return nil
	}
	ff := bson.M{}
	switch c.ConditionType {
	case view.ConditionTypeBasic:
		ff = lo.Assign(ff, filterBasic(c, sp))
	case view.ConditionTypeNullable:
		ff = lo.Assign(ff, filterNullable(c, sp))
	case view.ConditionTypeBool:
		ff = lo.Assign(ff, filterBool(c, sp))
	case view.ConditionTypeString:
		ff = lo.Assign(ff, filterString(c, sp))
	case view.ConditionTypeNumber:
		ff = lo.Assign(ff, filterNumber(c, sp))
	case view.ConditionTypeTime:
		ff = lo.Assign(ff, filterDate(c, sp))
	case view.ConditionTypeMultiple:
		ff = lo.Assign(ff, filterMultiple(c, sp))
	case view.ConditionTypeAnd:
		ff["$and"] = lo.Map(c.AndCondition.Conditions, func(c view.Condition, _ int) any {
			return filter(&c, sp)
		})
	case view.ConditionTypeOr:
		ff["$or"] = lo.Map(c.OrCondition.Conditions, func(c view.Condition, _ int) any {
			return filter(&c, sp)
		})
	default:
		return nil
	}
	return ff
}

func filterMultiple(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.MultipleCondition.Op {
	case view.MultipleOperatorIncludesAny:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$in": c.MultipleCondition.Value}
	case view.MultipleOperatorIncludesAll:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$all": c.MultipleCondition.Value}
	case view.MultipleOperatorNotIncludesAny:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$nin": c.MultipleCondition.Value}
	case view.MultipleOperatorNotIncludesAll:
		f[fieldKey(c.MultipleCondition.Field)] = bson.M{"$not": bson.M{"$all": c.MultipleCondition.Value}}
	}
	return f
}

func filterDate(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	v := c.TimeCondition.Value.Truncate(24 * time.Hour)
	switch c.TimeCondition.Op {
	case view.TimeOperatorAfter:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gt": v}
	case view.TimeOperatorAfterOrOn:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorBefore:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$lt": v}
	case view.TimeOperatorBeforeOrOn:
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$lte": v}
	case view.TimeOperatorOfThisWeek:
		v = startDayOfWeek(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorOfThisMonth:
		v = startDayOfMonth(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	case view.TimeOperatorOfThisYear:
		v = startDayOfYear(util.Now())
		f[fieldKey(c.TimeCondition.Field)] = bson.M{"$gte": v}
	}
	return f
}

func startDayOfWeek(t time.Time) time.Time {
	weekday := time.Duration(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	return t.Truncate(24 * time.Hour).Add(-1 * (weekday - 1) * 24 * time.Hour)
}

func startDayOfMonth(t time.Time) time.Time {
	return time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, t.Location())
}

func startDayOfYear(t time.Time) time.Time {
	return time.Date(t.Year(), 1, 1, 0, 0, 0, 0, t.Location())
}

func filterNumber(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.NumberCondition.Op {
	case view.NumberOperatorGreaterThan:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$gt": c.NumberCondition.Value}
	case view.NumberOperatorGreaterThanOrEqualTo:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$gte": c.NumberCondition.Value}
	case view.NumberOperatorLessThan:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$lt": c.NumberCondition.Value}
	case view.NumberOperatorLessThanOrEqualTo:
		f[fieldKey(c.NumberCondition.Field)] = bson.M{"$lte": c.NumberCondition.Value}
	}
	return f
}

func filterString(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.StringCondition.Op {
	case view.StringOperatorContains:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf(".*%s.*", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotContains:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf(".*%s.*", regexp.QuoteMeta(c.StringCondition.Value))}}
	case view.StringOperatorStartsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf("^%s", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotStartsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf("^%s", regexp.QuoteMeta(c.StringCondition.Value))}}
	case view.StringOperatorEndsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$regex": fmt.Sprintf("%s$", regexp.QuoteMeta(c.StringCondition.Value))}
	case view.StringOperatorNotEndsWith:
		f[fieldKey(c.StringCondition.Field)] = bson.M{"$not": bson.M{"$regex": fmt.Sprintf("%s$", regexp.QuoteMeta(c.StringCondition.Value))}}
	}
	return f
}

func filterBool(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.BoolCondition.Op {
	case view.BoolOperatorEquals:
		f[fieldKey(c.BoolCondition.Field)] = c.BoolCondition.Value
	case view.BoolOperatorNotEquals:
		f[fieldKey(c.BoolCondition.Field)] = bson.M{"$ne": c.BoolCondition.Value}
	}
	return f
}

func filterNullable(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.NullableCondition.Op {
	case view.NullableOperatorEmpty:
		f[fieldKey(c.NullableCondition.Field)] = bson.M{"$exists": false}
	case view.NullableOperatorNotEmpty:
		f[fieldKey(c.NullableCondition.Field)] = bson.M{"$exists": true}
	}
	return f
}

func filterBasic(c *view.Condition, sp schema.Package) bson.M {
	f := bson.M{}
	switch c.BasicCondition.Op {
	case view.BasicOperatorEquals:
		f[fieldKey(c.BasicCondition.Field)] = fieldValue(c.BasicCondition.Field, c.BasicCondition.Value, sp)
	case view.BasicOperatorNotEquals:
		f[fieldKey(c.BasicCondition.Field)] = bson.M{"$ne": fieldValue(c.BasicCondition.Field, c.BasicCondition.Value, sp)}
	}
	return f
}

func fieldKey(f view.FieldSelector) string {
	if f.Type == view.FieldTypeMetaField || f.Type == view.FieldTypeField {
		return "__temp." + f.ID.String() + ".0"
	}
	switch f.Type {
	case view.FieldTypeId:
		return "id"
	case view.FieldTypeCreationDate:
		return "__temp.createdAt"
	case view.FieldTypeCreationUser:
		return "__temp.createdBy"
	case view.FieldTypeModificationDate:
		return "__temp.updateAt"
	case view.FieldTypeModificationUser:
		return "__temp.updatedBy"
	case view.FieldTypeStatus:
		return "status"
	default:
		return "id"
	}
}

func fieldValue(fs view.FieldSelector, v any, sp schema.Package) any {
	if fs.Type == view.FieldTypeMetaField || fs.Type == view.FieldTypeField {
		f := sp.Field(*fs.ID)
		if f != nil && f.Type() == value.TypeDateTime {
			res, _ := time.Parse(time.RFC3339, v.(string))
			return res
		}
		return v
	}
	switch fs.Type {
	case view.FieldTypeId:
		res, _ := idx.From[id.Item](v.(string))
		return res.String()
	case view.FieldTypeCreationDate:
		res, _ := time.Parse(time.RFC3339, v.(string))
		return res.Truncate(24 * time.Hour)
	case view.FieldTypeCreationUser:
		res, _ := idx.From[id.User](v.(string))
		return res.String()
	case view.FieldTypeModificationDate:
		res, _ := time.Parse(time.RFC3339, v.(string))
		return res.Truncate(24 * time.Hour)
	case view.FieldTypeModificationUser:
		res, _ := idx.From[id.User](v.(string))
		return res.String()
	case view.FieldTypeStatus:
		return v
	default:
		return v
	}
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

func (r *Item) findOne(ctx context.Context, filter any, ref *version.Ref) (item.Versioned, error) {
	c := mongodoc.NewVersionedItemConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), version.Eq(ref.OrLatest().OrVersion()), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
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
