package memory

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type Model struct {
	data *util.SyncMap[id.ModelID, *model.Model]
	f    repo.WorkspaceFilter
	now  *util.TimeNow
	err  error
}

func NewModel() repo.Model {
	return &Model{
		data: &util.SyncMap[id.ModelID, *model.Model]{},
		now:  &util.TimeNow{},
	}
}

func (r *Model) Filtered(f repo.WorkspaceFilter) repo.Model {
	return &Model{
		data: r.data,
		f:    r.f.Merge(f),
		now:  &util.TimeNow{},
	}
}

func (r *Model) FindByProject(_ context.Context, pId id.ProjectID, _ *usecasex.Pagination) (model.List, *usecasex.PageInfo, error) {
	if r.err != nil {
		return nil, nil, r.err
	}

	// TODO: implement pagination

	/*if !r.f.CanRead(pId) {
		return nil, nil, nil
	}*/

	result := model.List(r.data.FindAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project().Equal(pId)
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

func (r *Model) CountByProject(_ context.Context, pId id.ProjectID) (int, error) {
	if r.err != nil {
		return 0, r.err
	}

	/*if !r.f.CanRead(pId) {
		return 0, nil
	}*/

	return r.data.CountAll(func(_ id.ModelID, m *model.Model) bool {
		return m.Project().Equal(pId)
	}), nil
}

func (r *Model) FindByKey(_ context.Context, pId id.ProjectID, key string) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	/*if !r.f.CanRead(pId) {
		return  nil, nil
	}*/

	m := r.data.Find(func(_ id.ModelID, m *model.Model) bool {
		return m.Key().String() == key && m.Project().Equal(pId)
	})
	if m == nil {
		return nil, rerror.ErrNotFound
	}

	return m, nil
}

func (r *Model) FindByID(_ context.Context, mId id.ModelID) (*model.Model, error) {
	if r.err != nil {
		return nil, r.err
	}

	m := r.data.Find(func(k id.ModelID, m *model.Model) bool {
		return k.Equal(mId) /*&& r.f.CanRead(m.Workspace())*/
	})

	if m != nil {
		return m, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Model) FindByIDs(_ context.Context, ids id.ModelIDList) (model.List, error) {
	if r.err != nil {
		return nil, r.err
	}

	result := r.data.FindAll(func(k id.ModelID, m *model.Model) bool {
		return ids.Has(k) /*&& r.f.CanRead(m.Workspace())*/
	})

	return model.List(result).SortByID(), nil
}

func (r *Model) Save(_ context.Context, m *model.Model) error {
	if r.err != nil {
		return r.err
	}

	/*if !r.f.CanWrite(m.Workspace()) {
		return repo.ErrOperationDenied
	}*/

	m.SetUpdatedAt(r.now.Now())
	r.data.Store(m.ID(), m)
	return nil
}

func (r *Model) Remove(_ context.Context, mId id.ModelID) error {
	if r.err != nil {
		return r.err
	}

	if _, ok := r.data.Load(mId); ok /*&& r.f.CanWrite(m.Workspace())*/ {
		r.data.Delete(mId)
		return nil
	}
	return rerror.ErrNotFound
}

func MockModelNow(r repo.Model, t time.Time) func() {
	return r.(*Model).now.Mock(t)
}

func SetModelError(r repo.Model, err error) {
	r.(*Model).err = err
}
