package memory

import (
	"context"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory/memorygit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
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

func (r *Item) Filtered(filter repo.ProjectFilter) repo.Item {
	return &Item{
		data: r.data,
		f:    r.f.Merge(filter),
	}
}

func (r *Item) FindByID(ctx context.Context, itemID id.ItemID) (item.Versioned, error) {
	if r.err != nil {
		return nil, r.err
	}

	item, ok := r.data.Load(itemID, version.Latest.OrVersion())
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return item, nil
}

func (r *Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(version.Latest.OrVersion())
		it := itv.Value()
		if it.Schema() == schemaID && r.f.CanRead(it.Project()) {
			res = append(res, itv)
		}
		return true
	})
	return res.SortByTimestamp(), nil, nil
}

func (r *Item) FindByProject(ctx context.Context, projectID id.ProjectID, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(version.Latest.OrVersion())
		it := itv.Value()
		if it.Project() == projectID {
			res = append(res, itv)
		}
		return true
	})

	return res.SortByTimestamp(), nil, nil
}

func (r *Item) FindByIDs(ctx context.Context, list id.ItemIDList, vor *version.VersionOrRef) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}
	if vor == nil {
		vor = version.Latest.OrVersion().Ref()
	}
	return item.VersionedList(r.data.LoadAll(list, *vor)).SortByTimestamp(), nil
}

func (r *Item) FindAllVersionsByID(ctx context.Context, id id.ItemID) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := r.data.LoadAllVersions(id).All()
	sortItems(res)
	return lo.Filter(res, func(i *version.Value[*item.Item], _ int) bool {
		return r.f.CanRead(i.Value().Project())
	}), nil
}

func (r *Item) Save(ctx context.Context, t *item.Item) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(t.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.SaveOne(t.ID(), t, nil)
	return nil
}

func (r *Item) Remove(ctx context.Context, itemID id.ItemID) error {
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

func (r *Item) IsArchived(ctx context.Context, itemID id.ItemID) (bool, error) {
	if r.err != nil {
		return false, r.err
	}

	i, _ := r.data.Load(itemID, version.Latest.OrVersion())
	if i == nil || !r.f.CanRead(i.Value().Project()) {
		return false, nil
	}

	return r.data.IsArchived(itemID), nil
}

func (r *Item) Archive(ctx context.Context, itemID id.ItemID, projectID id.ProjectID, archived bool) error {
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
	slices.SortStableFunc(items, func(a, b *version.Value[*item.Item]) bool {
		return a.Value().Timestamp().Before(b.Value().Timestamp())
	})
}

func (r *Item) Search(ctx context.Context, q *item.Query, pagination *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	var res item.VersionedList
	qq := q.Q()

	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		it := v.Get(version.Latest.OrVersion())
		itv := it.Value()
		if _, ok := lo.Find(itv.Fields(), func(f *item.Field) bool {
			if s, ok := f.Value().Value().ValueString(); ok {
				if strings.Contains(s, qq) {
					return true
				}
			}
			return false
		}); ok {
			res = append(res, it)
		}
		return true
	})
	return res, nil, nil
}

func (r *Item) FindByModelAndValue(ctx context.Context, modelID id.ModelID, fields []repo.FieldAndValue) (item.VersionedList, error) {
	if r.err != nil {
		return nil, r.err
	}

	var res item.VersionedList
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		itv := v.Get(version.Latest.OrVersion())
		it := itv.Value()
		if it.Model() == modelID {
			for _, f := range fields {
				for _, ff := range it.Fields() {
					if f.Field == ff.FieldID() && f.Value.Equal(f.Value) {
						res = append(res, itv)
					}
				}
			}
		}
		return true
	})
	return res, nil
}

func (r *Item) UpdateRef(ctx context.Context, itemID id.ItemID, vor *version.VersionOrRef, ref version.Ref) error {
	if r.err != nil {
		return r.err
	}

	r.data.UpdateRef(itemID, ref, vor)
	return nil
}
