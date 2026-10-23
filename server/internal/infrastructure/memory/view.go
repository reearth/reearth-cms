package memory

import (
	"context"
	"slices"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type View struct {
	data *util.SyncMap[id.ViewID, *view.View]
	f    repo.ProjectFilter
	err  error
}

func NewView() repo.View {
	return &View{
		data: &util.SyncMap[id.ViewID, *view.View]{},
	}
}

func (r *View) Filtered(f repo.ProjectFilter) repo.View {
	return &View{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *View) FindByID(_ context.Context, vid id.ViewID) (*view.View, error) {
	if r.err != nil {
		return nil, r.err
	}

	if v, ok := r.data.Load(vid); ok && r.f.CanRead(v.Project()) {
		return v.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *View) FindByModel(_ context.Context, mid id.ModelID) (view.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	// like mongo, no views is not an error and the result is sorted by order and ID
	var res view.List
	r.data.Range(func(_ id.ViewID, v *view.View) bool {
		if v.Model() == mid && r.f.CanRead(v.Project()) {
			res = append(res, v.Clone())
		}
		return true
	})
	slices.SortFunc(res, func(a, b *view.View) int {
		if a.Order() != b.Order() {
			return a.Order() - b.Order()
		}
		return a.ID().Compare(b.ID())
	})
	return res, nil
}

func (r *View) FindByIDs(_ context.Context, ids id.ViewIDList) (view.List, error) {
	if r.err != nil {
		return nil, r.err
	}
	if len(ids) == 0 {
		return nil, nil
	}

	// the result keeps the order of the given IDs, as mongo does
	res := make(view.List, 0, len(ids))
	for _, vid := range ids {
		if v, ok := r.data.Load(vid); ok && r.f.CanRead(v.Project()) {
			res = append(res, v.Clone())
		}
	}
	return res, nil
}

func (r *View) Save(_ context.Context, v *view.View) error {
	if r.err != nil {
		return r.err
	}

	if err := v.Validate(); err != nil {
		return err
	}
	if !r.f.CanWrite(v.Project()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(v.ID(), v.Clone())
	return nil
}

func (r *View) SaveAll(_ context.Context, views view.List) error {
	if r.err != nil {
		return r.err
	}
	if len(views) == 0 {
		return nil
	}

	if err := views.Validate(); err != nil {
		return err
	}
	if !r.f.CanWrite(views.Projects()...) {
		return repo.ErrOperationDenied
	}
	for _, v := range views {
		r.data.Store(v.ID(), v.Clone())
	}
	return nil
}

func (r *View) Remove(_ context.Context, vid id.ViewID) error {
	if r.err != nil {
		return r.err
	}

	if v, ok := r.data.Load(vid); ok && r.f.CanWrite(v.Project()) {
		r.data.Delete(vid)
		return nil
	}
	return rerror.ErrNotFound
}

func (r *View) RemoveByModel(_ context.Context, mid id.ModelID) error {
	if r.err != nil {
		return r.err
	}

	r.data.Range(func(k id.ViewID, v *view.View) bool {
		if v.Model() == mid && r.f.CanWrite(v.Project()) {
			r.data.Delete(k)
		}
		return true
	})
	return nil
}

func SetViewError(r repo.View, err error) {
	r.(*View).err = err
}
