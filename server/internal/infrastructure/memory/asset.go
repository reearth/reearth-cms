package memory

import (
	"context"
	"sort"
	"strings"
	"sync"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type Asset struct {
	lock sync.Mutex
	data map[id.AssetID]*asset.Asset
}

func NewAsset() repo.Asset {
	return &Asset{
		data: map[id.AssetID]*asset.Asset{},
	}
}

func (r *Asset) FindByID(ctx context.Context, id id.AssetID) (*asset.Asset, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	d, ok := r.data[id]
	if ok {
		return d, nil
	}
	return &asset.Asset{}, rerror.ErrNotFound
}

func (r *Asset) FindByIDs(ctx context.Context, ids id.AssetIDList) ([]*asset.Asset, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*asset.Asset{}
	for _, id := range ids {
		if d, ok := r.data[id]; ok {
			result = append(result, d)
			continue
		}
		result = append(result, nil)
	}
	return result, nil
}

func (r *Asset) FindByProject(ctx context.Context, id id.ProjectID, filter repo.AssetFilter) ([]*asset.Asset, *usecasex.PageInfo, error) {
	r.lock.Lock()
	defer r.lock.Unlock()

	result := []*asset.Asset{}
	for _, d := range r.data {
		if d.Project() == id && (filter.Keyword == nil || strings.Contains(d.FileName(), *filter.Keyword)) {
			result = append(result, d)
		}
	}

	if filter.Sort != nil {
		s := *filter.Sort
		sort.SliceStable(result, func(i, j int) bool {
			if s == asset.SortTypeID {
				return result[i].ID().Compare(result[j].ID()) < 0
			}
			if s == asset.SortTypeSize {
				return result[i].Size() < result[j].Size()
			}
			if s == asset.SortTypeName {
				return strings.Compare(result[i].FileName(), result[j].FileName()) < 0
			}
			return false
		})
	}

	var startCursor, endCursor *usecasex.Cursor
	if len(result) > 0 {
		_startCursor := usecasex.Cursor(result[0].ID().String())
		_endCursor := usecasex.Cursor(result[len(result)-1].ID().String())
		startCursor = &_startCursor
		endCursor = &_endCursor
	}

	return result, usecasex.NewPageInfo(
		len(r.data),
		startCursor,
		endCursor,
		true,
		true,
	), nil
}

func (r *Asset) Save(ctx context.Context, a *asset.Asset) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[a.ID()] = a
	return nil
}

func (r *Asset) Update(ctx context.Context, a *asset.Asset) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	r.data[a.ID()] = a
	return nil
}

func (r *Asset) Delete(ctx context.Context, id id.AssetID) error {
	r.lock.Lock()
	defer r.lock.Unlock()

	ok := r.data[id]
	if ok != nil {
		delete(r.data, id)
	}

	return nil
}
