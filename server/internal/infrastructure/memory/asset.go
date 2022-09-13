package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Asset struct {
	data *util.SyncMap[asset.ID, *asset.Asset]
	err  error
}

func NewAsset() repo.Asset {
	return &Asset{
		data: &util.SyncMap[id.AssetID, *asset.Asset]{},
	}
}

func (r *Asset) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	if r.err != nil {
		return nil, r.err
	}

	return rerror.ErrIfNil(r.data.Find(func(key asset.ID, value *asset.Asset) bool {
		return key == id
	}), rerror.ErrNotFound)
}

func (r *Asset) FindByIDs(ctx context.Context, ids id.AssetIDList) ([]*asset.Asset, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := r.data.FindAll(func(key asset.ID, value *asset.Asset) bool {
		return ids.Has(key)
	})
	slices.SortFunc(res, func(a, b *asset.Asset) bool { return a.ID().Compare(b.ID()) < 0 })
	return res, nil
}

func (r *Asset) FindByProject(ctx context.Context, id id.ProjectID, filter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
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
		len(result),
		startCursor,
		endCursor,
		true,
		true,
	), nil

}

func (r *Asset) Save(ctx context.Context, a *asset.Asset) error {
	if r.err != nil {
		return r.err
	}

	r.data.Store(a.ID(), a)
	return nil
}

func (r *Asset) Update(ctx context.Context, a *asset.Asset) error {
	if r.err != nil {
		return r.err
	}

	r.data.Store(a.ID(), a)
	return nil
}

func (r *Asset) Delete(ctx context.Context, id id.AssetID) error {
	if r.err != nil {
		return r.err
	}

	if _, ok := r.data.Load(id); ok {
		r.data.Delete(id)
	}
	return nil
}
