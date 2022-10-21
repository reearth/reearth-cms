package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
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

func (r *Thread) FindByIDs(ctx context.Context, ids id.ThreadIDList) ([]*thread.Thread, error) {
	if r.err != nil {
		return nil, r.err
	}

	res := thread.List(r.data.FindAll(func(key thread.ID, value *thread.Thread) bool {
		return ids.Has(key) && r.f.CanRead(value.Workspace())
	})).SortByID()
	return res, nil
}

func (r *Thread) CreateThread(ctx context.Context, wid id.WorkspaceID) (*thread.Thread, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanWrite(wid) {
		return nil, repo.ErrOperationDenied
	}

	th := thread.New().NewID().Workspace(wid).Comments([]*thread.Comment{}).MustBuild()
	if err := r.Save(ctx, th); err != nil {
		return nil, err
	}

	return th, nil
}

func (r *Thread) AddComment(ctx context.Context, th *thread.Thread, c *thread.Comment) (*thread.Comment, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return nil, repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.AddComment(c); err != nil {
		return nil, err
	}

	if err := r.Save(ctx, th1); err != nil {
		return nil, err
	}

	return c, nil
}

func (r *Thread) UpdateComment(ctx context.Context, th *thread.Thread, cid id.CommentID, content string) (*thread.Comment, error) {
	if r.err != nil {
		return nil, r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return nil, repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.UpdateComment(cid, content); err != nil {
		return nil, err
	}

	if err := r.Save(ctx, th1); err != nil {
		return nil, err
	}

	c := lo.Must(th1.Comment(cid))
	return c, nil
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
