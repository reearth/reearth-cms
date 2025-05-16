package memory

import (
	"context"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Asset struct {
	data *util.SyncMap[asset.ID, *asset.Asset]
	err  error
	f    repo.ProjectFilter
}

func NewAsset() repo.Asset {
	return &Asset{
		data: &util.SyncMap[id.AssetID, *asset.Asset]{},
	}
}

func (r *Asset) Filtered(f repo.ProjectFilter) repo.Asset {
	return &Asset{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Asset) FindByID(_ context.Context, id id.AssetID) (*asset.Asset, error) {
	if r.err != nil {
		return nil, r.err
	}

	return rerror.ErrIfNil(r.data.Find(func(key asset.ID, value *asset.Asset) bool {
		return key == id && r.f.CanRead(value.Project())
	}), rerror.ErrNotFound)
}

func (r *Asset) FindByUUID(_ context.Context, uuid string) (*asset.Asset, error) {
	if r.err != nil {
		return nil, r.err
	}

	return rerror.ErrIfNil(r.data.Find(func(key asset.ID, value *asset.Asset) bool {
		return value.UUID() == uuid && r.f.CanRead(value.Project())
	}), rerror.ErrNotFound)
}

func (r *Asset) FindByIDs(_ context.Context, ids id.AssetIDList) (asset.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := asset.List(r.data.FindAll(func(key asset.ID, value *asset.Asset) bool {
		return ids.Has(key) && r.f.CanRead(value.Project())
	})).SortByID()
	return res, nil
}

func (r *Asset) FindByProject(_ context.Context, id id.ProjectID, filter repo.AssetFilter) (asset.List, *usecasex.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	if r.err != nil {
		return nil, nil, r.err
	}

	result := asset.List(r.data.FindAll(func(_ asset.ID, v *asset.Asset) bool {
		return v.Project() == id
	})).SortByID()

	var startCursor, endCursor *usecasex.Cursor
	if len(result) > 0 {
		startCursor = lo.ToPtr(usecasex.Cursor(result[0].ID().String()))
		endCursor = lo.ToPtr(usecasex.Cursor(result[len(result)-1].ID().String()))
	}

	return result, usecasex.NewPageInfo(
		int64(len(result)),
		startCursor,
		endCursor,
		true,
		true,
	), nil

}

func (r *Asset) Search(ctx context.Context, id id.ProjectID, filter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
	if !r.f.CanRead(id) {
		return nil, usecasex.EmptyPageInfo(), nil
	}

	if r.err != nil {
		return nil, nil, r.err
	}

	result := asset.List(r.data.FindAll(func(_ asset.ID, v *asset.Asset) bool {
		// Base filter: project ID match
		if v.Project() != id {
			return false
		}

		// Keyword filter
		if filter.Keyword != nil && *filter.Keyword != "" {
			if !strings.Contains(strings.ToLower(v.FileName()), strings.ToLower(*filter.Keyword)) {
				return false
			}
		}
		// Content type filter can't be performed as it's not stored in memory

		return true
	})).SortByID()

	var startCursor, endCursor *usecasex.Cursor
	if len(result) > 0 {
		startCursor = lo.ToPtr(usecasex.Cursor(result[0].ID().String()))
		endCursor = lo.ToPtr(usecasex.Cursor(result[len(result)-1].ID().String()))
	}

	return result, usecasex.NewPageInfo(
		int64(len(result)),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Asset) Save(_ context.Context, a *asset.Asset) error {
	if !r.f.CanWrite(a.Project()) {
		return repo.ErrOperationDenied
	}

	if r.err != nil {
		return r.err
	}

	r.data.Store(a.ID(), a)
	return nil
}

func (r *Asset) Delete(_ context.Context, id id.AssetID) error {
	if r.err != nil {
		return r.err
	}

	if a, ok := r.data.Load(id); ok && r.f.CanWrite(a.Project()) {
		r.data.Delete(id)
	}
	return nil
}

func (r *Asset) BatchDelete(ctx context.Context, ids id.AssetIDList) error {
	if r.err != nil {
		return r.err
	}

	for _, id := range ids {
		if a, ok := r.data.Load(id); ok && r.f.CanWrite(a.Project()) {
			r.data.Delete(id)
		}
	}
	return nil
}
