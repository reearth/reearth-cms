package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearthx/mongox"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	viewIndexes       = []string{"project", "modelid"}
	viewUniqueIndexes = []string{"id"}
)

type View struct {
	client *mongox.Collection
	f      repo.ProjectFilter
}

func NewView(client *mongox.Client) repo.View {
	return &View{client: client.WithCollection("view")}
}

func (r *View) Init() error {
	return createIndexes(context.Background(), r.client, viewIndexes, viewUniqueIndexes)
}

func (r *View) Filtered(f repo.ProjectFilter) repo.View {
	return &View{
		client: r.client,
		f:      r.f.Merge(f),
	}
}

func (r *View) FindByID(ctx context.Context, viewID id.ViewID) (*view.View, error) {
	return r.findOne(ctx, bson.M{
		"id": viewID.String(),
	})
}

func (r *View) FindByIDs(ctx context.Context, ids id.ViewIDList) (view.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	res, err := r.find(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	})
	if err != nil {
		return nil, err
	}

	return prepareViews(ids, res), nil
}

func (r *View) FindByModel(ctx context.Context, modelID view.ModelID) (view.List, error) {
	return r.find(ctx, bson.M{"modelid": modelID.String()}, options.Find().SetSort(bson.D{{Key: "order", Value: 1}, {Key: "id", Value: 1}}))
}

func (r *View) Save(ctx context.Context, view *view.View) error {
	if err := view.Validate(); err != nil {
		return err
	}
	if !r.f.CanWrite(view.Project()) {
		return repo.ErrOperationDenied
	}
	doc, sId := mongodoc.NewView(view)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *View) SaveAll(ctx context.Context, list view.List) error {
	if len(list) == 0 {
		return nil
	}
	if err := list.Validate(); err != nil {
		return err
	}
	if !r.f.CanWrite(list.Projects()...) {
		return repo.ErrOperationDenied
	}
	docs, ids := mongodoc.NewViews(list)
	docsAny := make([]any, 0, len(list))
	for _, d := range docs {
		docsAny = append(docsAny, d)
	}
	return r.client.SaveAll(ctx, ids, docsAny)
}

func (r *View) Remove(ctx context.Context, viewID id.ViewID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": viewID.String()}))
}

func (r *View) RemoveByModel(ctx context.Context, modelID id.ModelID) error {
	return r.client.RemoveAll(ctx, r.writeFilter(bson.M{"modelid": modelID.String()}))
}

func (r *View) findOne(ctx context.Context, filter any) (*view.View, error) {
	c := mongodoc.NewViewConsumer()
	if err := r.client.FindOne(ctx, r.readFilter(filter), c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *View) find(ctx context.Context, filter any, opts ...*options.FindOptions) (view.List, error) {
	c := mongodoc.NewViewListConsumer()
	if err := r.client.Find(ctx, r.readFilter(filter), c, opts...); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *View) readFilter(filter any) any {
	return applyProjectFilter(filter, readableProjects(r.f))
}

func (r *View) writeFilter(filter any) any {
	return applyProjectFilter(filter, r.f.Writable)
}

// prepareViews skips unknown IDs and sorts the results according to the given IDs
func prepareViews(ids id.ViewIDList, rows view.List) view.List {
	res := make(view.List, 0, len(ids))
	for _, vid := range ids {
		for _, r := range rows {
			if r.ID() == vid {
				res = append(res, r)
				break
			}
		}
	}
	return res
}
