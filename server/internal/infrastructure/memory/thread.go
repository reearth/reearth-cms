package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
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

	p := r.data.Find(func(k id.ThreadID, v *thread.Thread) bool {
		return k == thid && r.f.CanRead(v.Workspace())
	})

	if p != nil {
		return p, nil
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
	comments := append(th1.Comments(), c)
	th1.SetComments(comments...)

	r.data.Store(th1.ID(), th1)
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
	comments := th1.Comments()
	i := slices.IndexFunc(comments, func(c2 *thread.Comment) bool { return c2.ID() == c.ID() })
	comments[i].SetContent(c.Content())

	r.data.Store(th1.ID(), th1)
	return nil
}

func (r *Thread) DeleteComment(ctx context.Context, th *thread.Thread, id id.CommentID) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	i := slices.IndexFunc(th1.Comments(), func(c *thread.Comment) bool { return c.ID() == id })
	comments := append(th1.Comments()[:i], th1.Comments()[i+1:]...)
	th1.SetComments(comments...)

	r.data.Store(th1.ID(), th1)
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
