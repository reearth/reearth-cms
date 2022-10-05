package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
)

type threadRepo struct {
	client *mongox.ClientCollection
}

func NewThread(client *mongox.Client) repo.Thread {
	r := &threadRepo{client: client.WithCollection("thread")}
	r.init()
	return r
}

func (r *threadRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"workspace", "author"}, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "thread", i)
	}
}

func (r *threadRepo) Filtered(f repo.WorkspaceFilter) repo.Thread {
	return &threadRepo{
		client: r.client,
	}
}

func (r *threadRepo) AddComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	panic("implement me")
}

func (r *threadRepo) UpdateComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	panic("implement me")
}

func (r *threadRepo) DeleteComment(ctx context.Context, thid id.ThreadID, id id.CommentID) error {
	panic("implement me")
}
