package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/util"
)

type Thread struct {
	data *util.SyncMap[thread.ID, *thread.Thread]
	// err  error
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

func (r *Thread) AddComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	panic("implement me")
}

func (r *Thread) UpdateComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	panic("implement me")
}

func (r *Thread) DeleteComment(ctx context.Context, thid id.ThreadID, id id.CommentID) error {
	panic("implement me")
}
