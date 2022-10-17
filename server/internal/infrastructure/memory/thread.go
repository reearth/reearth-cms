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

func (r *Thread) Filtered(f repo.WorkspaceFilter) repo.Thread {
	return &Thread{
		data: r.data,
		f:    r.f.Merge(f),
	}
}

func (r *Thread) FindByID(ctx context.Context, thid id.ThreadID) (*thread.Thread, error) {
	if r.err != nil {
		return nil, r.err
	}

	th := r.data.Find(func(k id.ThreadID, v *thread.Thread) bool {
		return k == thid && r.f.CanRead(v.Workspace())
	})

	if th != nil {
		return th, nil
	}
	return nil, rerror.ErrNotFound
}

func (r *Thread) AddComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.AddComment(c); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return err
	}

	return nil
}

func (r *Thread) UpdateComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.UpdateComment(c.ID(), c.Content()); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return err
	}

	return nil
}

func (r *Thread) DeleteComment(ctx context.Context, th *thread.Thread, cid id.CommentID) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.DeleteComment(cid); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return err
	}

	return nil
}

func (r *Thread) Save(_ context.Context, th *thread.Thread) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	r.data.Store(th.ID(), th)
	return nil
}

func SetThreadError(r repo.Thread, err error) {
	r.(*Thread).err = err
}
