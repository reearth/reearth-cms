package memory

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory/memorygit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Item struct {
	data *memorygit.VersionedSyncMap[item.ID, *item.Item]
	f    repo.ProjectFilter
	err  error
}

func NewItem() repo.Item {
	return &Item{
		data: memorygit.NewVersionedSyncMap[item.ID, *item.Item](),
	}
}

func (r *Item) FindByAssets(_ context.Context, list id.AssetIDList, ref *version.Ref) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(ref.OrLatest().OrVersion())
		it := itv.Value()
		if it.AssetIDs().Has(list...) {
			res = append(res, itv)
		}
		return true
	})
	return res, nil
}

func (r *Item) Filtered(filter repo.ProjectFilter) repo.Item {
	return &Item{
		data: r.data,
		f:    r.f.Merge(filter),
	}
}

func (r *Item) FindByID(_ context.Context, itemID id.ItemID, ref *version.Ref) (item.Versioned, error) {
	if r.err != nil {
		return nil, r.err
	}

	item, ok := r.data.Load(itemID, ref.OrLatest().OrVersion())
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return item, nil
}

func (r *Item) FindBySchema(_ context.Context, schemaID id.SchemaID, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(ref.OrLatest().OrVersion())
		it := itv.Value()
		if it.Schema() == schemaID && r.f.CanRead(it.Project()) {
			res = append(res, itv)
		}
		return true
	})
	return res, nil, nil
}

func (r *Item) FindByModel(_ context.Context, modelID id.ModelID, ref *version.Ref, sort *usecasex.Sort, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(ref.OrLatest().OrVersion())
		it := itv.Value()
		if it.Model() == modelID {
			res = append(res, itv)
		}
		return true
	})

	return res, nil, nil
}

func (r *Item) FindByIDs(_ context.Context, list id.ItemIDList, ref *version.Ref) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.data.LoadAll(list, lo.ToPtr(ref.OrLatest().OrVersion())), nil
}

func (r *Item) FindVersionByID(_ context.Context, itemID id.ItemID, ver version.VersionOrRef) (item.Versioned, error) {
	if r.err != nil {
		return nil, r.err
	}

	item, ok := r.data.Load(itemID, ver)
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return item, nil
}

func (r *Item) FindAllVersionsByID(_ context.Context, id id.ItemID) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := r.data.LoadAllVersions(id).All()
	sortItems(res)
	return lo.Filter(res, func(i *version.Value[*item.Item], _ int) bool {
		return r.f.CanRead(i.Value().Project())
	}), nil
}

func (r *Item) FindAllVersionsByIDs(_ context.Context, ids id.ItemIDList) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := r.data.LoadAll(ids, nil)
	sortItems(res)
	return lo.Filter(res, func(i *version.Value[*item.Item], _ int) bool {
		return r.f.CanRead(i.Value().Project())
	}), nil
}

func (r *Item) LastModifiedByModel(_ context.Context, modelID id.ModelID) (time.Time, error) {
	if r.err != nil {
		return time.Time{}, r.err
	}

	res := r.data.Find(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(version.Latest.OrVersion())
		it := itv.Value()
		return it.Model() == modelID
	})

	if res == nil {
		return time.Time{}, rerror.ErrNotFound
	}
	return res.Latest().Time(), nil
}

func (r *Item) Save(_ context.Context, t *item.Item) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(t.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.SaveOne(t.ID(), t, nil)
	return nil
}

func (r *Item) SaveAll(_ context.Context, il item.List) error {
	if r.err != nil {
		return r.err
	}

	for _, t := range il {
		if !r.f.CanWrite(t.Project()) {
			return repo.ErrOperationDenied
		}
	}
	r.data.SaveAll(il.IDs(), il, nil)
	return nil
}

func (r *Item) UpdateRef(_ context.Context, item id.ItemID, ref version.Ref, vr *version.VersionOrRef) error {
	if r.err != nil {
		return r.err
	}

	r.data.UpdateRef(item, ref, vr)
	return nil
}

func (r *Item) Remove(_ context.Context, itemID id.ItemID) error {
	if r.err != nil {
		return r.err
	}

	item, _ := r.data.Load(itemID, version.Latest.OrVersion())
	if item == nil {
		return rerror.ErrNotFound
	}
	if !r.f.CanWrite(item.Value().Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Delete(itemID)
	return nil
}

func (r *Item) IsArchived(_ context.Context, itemID id.ItemID) (bool, error) {
	if r.err != nil {
		return false, r.err
	}

	i, _ := r.data.Load(itemID, version.Latest.OrVersion())
	if i == nil || !r.f.CanRead(i.Value().Project()) {
		return false, nil
	}

	return r.data.IsArchived(itemID), nil
}

func (r *Item) Archive(_ context.Context, itemID id.ItemID, projectID id.ProjectID, archived bool) error {
	if r.err != nil {
		return r.err
	}

	iv, _ := r.data.Load(itemID, version.Latest.OrVersion())
	if iv == nil {
		return rerror.ErrNotFound
	}
	i := iv.Value()

	if !r.f.CanWrite(i.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Archive(itemID, archived)
	return nil
}

func SetItemError(r repo.Item, err error) {
	r.(*Item).err = err
}

func (r *Item) Len() int {
	return r.data.Len()
}

func sortItems(items []*version.Value[*item.Item]) {
	slices.SortStableFunc(items, func(a, b *version.Value[*item.Item]) int {
		return a.Value().Timestamp().Compare(b.Value().Timestamp())
	})
}

func (r *Item) Search(_ context.Context, sp schema.Package, q *item.Query, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	// TODO: support filters, sort, and pagination
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	qq := q.Keyword()

	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		it := v.Get(version.Latest.OrVersion())
		itv := it.Value()
		_, searchMatched := lo.Find(itv.Fields(), func(f *item.Field) bool {
			return lo.SomeBy(f.Value().Values(), func(v *value.Value) bool {
				if s, ok := v.ValueString(); ok {
					if strings.Contains(s, qq) {
						return true
					}
				}
				return false
			})
		})
		schemaMatched := q.Schema() == nil || itv.Schema() == *q.Schema()
		modelMatched := itv.Model() == q.Model()
		if searchMatched && schemaMatched && modelMatched && r.f.CanRead(itv.Project()) {
			res = append(res, it)
		}
		return true
	})
	return res, nil, nil
}

func (r *Item) FindByModelAndValue(_ context.Context, modelID id.ModelID, fields []repo.FieldAndValue, ref *version.Ref) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(ref.OrLatest().OrVersion())
		it := itv.Value()
		if it.Model() == modelID {
			for _, f := range fields {
				for _, ff := range it.Fields() {
					if f.Field == ff.FieldID() && f.Value.Equal(ff.Value()) {
						res = append(res, itv)
					}
				}
			}
		}
		return true
	})
	return res, nil
}

func (r *Item) CountByModel(_ context.Context, modelID id.ModelID) (int, error) {
	if r.err != nil {
		return 0, r.err
	}

	count := 0
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(version.Latest.OrVersion())
		it := itv.Value()
		if it.Model() == modelID && r.f.CanRead(it.Project()) {
			count++
		}
		return true
	})
	return count, nil
}

func (r *Item) Copy(ctx context.Context, params repo.CopyParams) (*string, *string, error) {
	filter, err := json.Marshal(map[string]any{"schema": params.OldSchema.String()})
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
