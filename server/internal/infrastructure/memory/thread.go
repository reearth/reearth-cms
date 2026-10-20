package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type Thread struct {
	data *util.SyncMap[thread.ID, *thread.Thread]
	f    repo.WorkspaceFilter
	err  error
}

func NewThread() repo.Thread {
	return &Thread{
		data: &util.SyncMap[id.ThreadID, *thread.Thread]{},
	}
}

func (r *Thread) Save(_ context.Context, th *thread.Thread) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(th.ID(), th.Clone())
	return nil
}

func (r *Thread) SaveAll(_ context.Context, th thread.List) error {
	if r.err != nil {
		return r.err
	}

	for _, t := range th {
		if !r.f.CanWrite(t.Workspace()) {
			return repo.ErrOperationDenied
		}
	}
	r.data.StoreAll(th.Clone().ToMap())
	return nil
}

func (r *Thread) Filtered(f repo.WorkspaceFilter) repo.Thread {
	return &Thread{
		data: r.data,
		f:    r.f.Merge(f),
		err:  r.err,
	}
}

func (r *Thread) FindByID(_ context.Context, thid id.ThreadID) (*thread.Thread, error) {
	if r.err != nil {
		return nil, r.err
	}

	if th, ok := r.data.Load(thid); ok && r.canRead(th) {
		return th.Clone(), nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Thread) FindByIDs(_ context.Context, ids id.ThreadIDList) ([]*thread.Thread, error) {
	if r.err != nil {
		return nil, r.err
	}
	if len(ids) == 0 {
		return nil, nil
	}

	// the result keeps the order of the given IDs, as mongo does
	res := make([]*thread.Thread, 0, len(ids))
	for _, thid := range ids {
		if th, ok := r.data.Load(thid); ok && r.canRead(th) {
			res = append(res, th.Clone())
		}
	}
	return res, nil
}

func (r *Thread) Remove(_ context.Context, thid id.ThreadID) error {
	if r.err != nil {
		return r.err
	}

	if _, ok := r.data.Load(thid); !ok {
		return rerror.ErrNotFound
	}
	r.data.Delete(thid)
	return nil
}

func (r *Thread) RemoveByIDs(_ context.Context, ids id.ThreadIDList) error {
	if r.err != nil {
		return r.err
	}

	for _, thid := range ids {
		r.data.Delete(thid)
	}
	return nil
}

func (r *Thread) canRead(th *thread.Thread) bool {
	return r.f.Readable == nil || r.f.Readable.Has(th.Workspace())
}

func SetThreadError(r repo.Thread, err error) {
	r.(*Thread).err = err
}
