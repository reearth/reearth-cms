package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory/memorygit"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
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

func (r *Item) FindByID(ctx context.Context, itemID id.ItemID) (*item.Item, error) {
	if r.err != nil {
		return nil, r.err
	}

	item, ok := r.data.Load(itemID, version.Latest.OrVersion())
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return item, nil
}

func (r *Item) FindBySchema(ctx context.Context, schemaID id.SchemaID, pid id.ProjectID, pagination *usecasex.Pagination) (item.List, *usecasex.PageInfo, error) {
	if !r.f.CanRead(pid) {
		return nil, usecasex.EmptyPageInfo(), nil
	}
	if r.err != nil {
		return nil, nil, r.err
	}
	var res item.List
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		it := v.Get(version.Latest.OrVersion()).Value()
		if it.Schema() == schemaID {
			res = append(res, it)
		}
		return true
	})
	return res, nil, nil
}

func (r *Item) FindByProject(ctx context.Context, projectID id.ProjectID, pagination *usecasex.Pagination) (item.List, *usecasex.PageInfo, error) {
	if !r.f.CanRead(projectID) {
		r.err = repo.ErrOperationDenied
	}
	if r.err != nil {
		return nil, nil, r.err
	}
	var res item.List
	r.data.Range(func(k item.ID, v *version.Values[*item.Item]) bool {
		it := v.Get(version.Latest.OrVersion()).Value()
		if it.Project() == projectID {
			res = append(res, it)
		}
		return true
	})
	return res, nil, nil
}

func (r *Item) FindByIDs(ctx context.Context, list id.ItemIDList) (item.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	return r.data.LoadAll(list, version.Latest.OrVersion()), nil
}

func (r *Item) FindAllVersionsByID(ctx context.Context, id id.ItemID, projectID id.ProjectID) ([]*version.Value[*item.Item], error) {
	if !r.f.CanRead(projectID) {
		r.err = repo.ErrOperationDenied
	}
	if r.err != nil {
		return nil, r.err
	}

	return r.data.LoadAllVersions(id).All(), nil
}

func (r *Item) Save(ctx context.Context, t *item.Item) error {
	if !r.f.CanWrite(t.Project()) {
		r.err = repo.ErrOperationDenied
	}
	if r.err != nil {
		return r.err
	}

	r.data.SaveOne(t.ID(), t, nil)
	return nil
}

func (r *Item) Remove(ctx context.Context, itemID id.ItemID, projectID id.ProjectID) error {
	if !r.f.CanWrite(projectID) {
		r.err = repo.ErrOperationDenied
	}
	if r.err != nil {
		return r.err
	}

	r.data.Delete(itemID)
	return nil
}

func (r *Item) Archive(ctx context.Context, itemID id.ItemID, archived bool) error {
	if r.err != nil {
		return r.err
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
