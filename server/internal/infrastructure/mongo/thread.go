package mongo

import (
	"context"

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

func (r *threadRepo) AddComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	filter := bson.M{"id": th.ID().String()}
	update := bson.M{"$push": bson.M{"comments": c}}

	if _, err := r.client.Client().UpdateMany(ctx, r.writeFilter(filter), update); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) UpdateComment(ctx context.Context, th *thread.Thread, c *thread.Comment) error {
	_, i, ok := lo.FindIndexOf(th.Comments(), func(c2 *thread.Comment) bool {
		return c2.ID() == c.ID()
	})

	if !ok {
		return nil
	}

	filter := bson.M{"id": th.ID().String()}
	update := bson.M{"$set": bson.M{"comments." + string(rune(i)) + ".content": c.Content()}}
	if _, err := r.client.Client().UpdateMany(ctx, r.writeFilter(filter), update); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) DeleteComment(ctx context.Context, th *thread.Thread, id id.CommentID) error {
	_, i, ok := lo.FindIndexOf(th.Comments(), func(c *thread.Comment) bool {
		return c.ID() == id
	})

	if !ok {
		return nil
	}

	filter := bson.M{"id": th.ID().String()}
	update := bson.M{"$set": bson.M{"comments." + string(rune(i)): nil}}
	if _, err := r.client.Client().UpdateMany(ctx, r.writeFilter(filter), update); err != nil {
		return err
	}
	update = bson.M{"$pull": bson.M{"comments": nil}}
	if _, err := r.client.Client().UpdateMany(ctx, r.writeFilter(filter), update); err != nil {
		return err
	}
	return nil
}

func (r *threadRepo) writeFilter(filter any) any {
	return applyWorkspaceFilter(filter, r.f.Writable)
}
