package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
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
	}
}

func (r *Thread) AddComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	comments := append(th.Comments(), c)
	th.SetComments(comments...)

	r.data.Store(th.ID(), th)
	return nil
}

func (r *Thread) UpdateComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	cc, ok := lo.Find(th.Comments(), func(c2 *thread.Comment) bool {
		return c2.ID() == c.ID()
	})

	if !ok {
		return nil
	}

	cc.SetContent(c.Content())

	r.data.Store(th.ID(), th)
	return nil
}

func (r *Thread) DeleteComment(ctx context.Context, th *thread.Thread, id id.CommentID) error {
	if r.err != nil {
		return r.err
	}

	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	_, i, ok := lo.FindIndexOf(th.Comments(), func(c *thread.Comment) bool {
		return c.ID() == id
	})

	if !ok {
		return nil
	}

	comments := lo.Filter(th.Comments(), func(x *thread.Comment, index int) bool {
		return index != i
	})

	th.SetComments(comments...)
	r.data.Store(th.ID(), th)
	return nil
}
