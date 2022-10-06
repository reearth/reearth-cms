package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
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
	}
}

func (r *threadRepo) AddComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	th, err := r.findOne(ctx, bson.M{
		"id": thid.String(),
	})
	if err != nil {
		return err
	}

	th.AddComment(*c)

	doc, id := mongodoc.NewThread(th)
	if err := r.client.SaveOne(ctx, id, doc); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) UpdateComment(ctx context.Context, thid id.ThreadID, c *thread.Comment) error {
	th, err := r.findOne(ctx, bson.M{
		"id": thid.String(),
	})
	if err != nil {
		return err
	}

	cc, ok := lo.Find(th.Comments(), func(c2 *thread.Comment) bool {
		return c2.ID() == c.ID()
	})

	if !ok {
		return nil
	}
	cc.SetContent(c.Content())

	doc, thid2 := mongodoc.NewThread(th)
	if err := r.client.SaveOne(ctx, thid2, doc); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) DeleteComment(ctx context.Context, thid id.ThreadID, id id.CommentID) error {
	th, err := r.findOne(ctx, bson.M{
		"id": thid.String(),
	})
	if err != nil {
		return err
	}

	_, i, ok := lo.FindIndexOf(th.Comments(), func(c *thread.Comment) bool {
		return c.ID() == id
	})

	if !ok {
		return nil
	}
	comments := removeIndex(th.Comments(), i)
	th.SetComments(comments...)

	doc, thid2 := mongodoc.NewThread(th)
	if err := r.client.SaveOne(ctx, thid2, doc); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) findOne(ctx context.Context, filter interface{}) (*thread.Thread, error) {
	c := mongodoc.NewThreadConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func removeIndex[T any](s []T, index int) []T {
	return append(s[:index], s[index+1:]...)
}
func (r *threadRepo) readFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Readable)
}

// func (r *threadRepo) writeFilter(filter any) any {
// 	return applyWorkspaceFilter(filter, r.f.Writable)
// }
