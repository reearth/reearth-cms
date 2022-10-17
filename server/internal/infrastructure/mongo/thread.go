package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"go.mongodb.org/mongo-driver/bson"
)

type threadRepo struct {
	client *mongox.ClientCollection
	f      repo.WorkspaceFilter
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
		f:      r.f.Merge(f),
	}
}

func (r *threadRepo) FindByID(ctx context.Context, id id.ThreadID) (*thread.Thread, error) {
	return r.findOne(ctx, bson.M{
		"id": id.String(),
	})
}

func (r *threadRepo) AddComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.AddComment(c); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *threadRepo) UpdateComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.UpdateComment(c.ID(), c.Content()); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *threadRepo) DeleteComment(ctx context.Context, th *thread.Thread, id id.CommentID) error {
	if !r.f.CanWrite(th.Workspace()) {
		return repo.ErrOperationDenied
	}

	th1 := th.Clone()
	if err := th1.DeleteComment(id); err != nil {
		return err
	}

	if err := r.Save(ctx, th1); err != nil {
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func (r *threadRepo) Save(ctx context.Context, thread *thread.Thread) error {
	if !r.f.CanWrite(thread.Workspace()) {
		return repo.ErrOperationDenied
	}
	doc, id := mongodoc.NewThread(thread)
	return r.client.SaveOne(ctx, id, doc)
}

func (r *threadRepo) findOne(ctx context.Context, filter any) (*thread.Thread, error) {
	c := mongodoc.NewThreadConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *threadRepo) readFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

// func (r *threadRepo) writeFilter(filter any) any {
// 	return applyWorkspaceFilter(filter, r.f.Writable)
// }
