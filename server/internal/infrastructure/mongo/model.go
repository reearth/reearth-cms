package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type modelRepo struct {
	client *mongodoc.ClientCollection
	f      *repo.WorkspaceFilter
}

func NewModel(client *mongodoc.Client) repo.Model {
	r := &modelRepo{client: client.WithCollection("model")}
	r.init()
	return r
}

func (r *modelRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"key", "project", "workspace"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "model", i)
	}
}

func (r *modelRepo) Filtered(f repo.WorkspaceFilter) repo.Model {
	return &modelRepo{
		client: r.client,
		f:      lo.ToPtr(r.f.Merge(f)),
	}
}

func (r *modelRepo) FindByID(ctx context.Context, modelID id.ModelID) (*model.Model, error) {
	return r.findOne(ctx, bson.M{
		"id": modelID.String(),
	})
}

func (r *modelRepo) FindByIDs(ctx context.Context, ids id.ModelIDList) (model.List, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	filter := bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	}
	dst := make(model.List, 0, len(ids))
	res, err := r.find(ctx, dst, filter)
	if err != nil {
		return nil, err
	}
	return prepare(ids, res), nil
}

func (r *modelRepo) FindByProject(ctx context.Context, pId id.ProjectID, pagination *usecase.Pagination) (model.List, *usecase.PageInfo, error) {
	return r.paginate(ctx, bson.M{
		"project": pId.String(),
	}, pagination)
}

func (r *modelRepo) FindByKey(ctx context.Context, projectID id.ProjectID, key string) (*model.Model, error) {
	if len(key) == 0 {
		return nil, rerror.ErrNotFound
	}
	return r.findOne(ctx, bson.M{
		"key":     key,
		"project": projectID.String(),
	})
}

func (r *modelRepo) CountByProject(ctx context.Context, projectID id.ProjectID) (int, error) {
	count, err := r.client.Count(ctx, bson.M{
		"project": projectID.String(),
	})
	return int(count), err
}

func (r *modelRepo) Save(ctx context.Context, model *model.Model) error {
	// if !r.f.CanWrite(model.) {
	// 	return repo.ErrOperationDenied
	// }
	doc, mId := mongodoc.NewModel(model)
	return r.client.SaveOne(ctx, mId, doc)
}

func (r *modelRepo) Remove(ctx context.Context, modelID id.ModelID) error {
	return r.client.RemoveOne(ctx, r.writeFilter(bson.M{"id": modelID.String()}))
}

func (r *modelRepo) findOne(ctx context.Context, filter interface{}) (*model.Model, error) {
	dst := make(model.List, 0, 1)
	c := mongodoc.ModelConsumer{
		Rows: dst,
	}
	if err := r.client.FindOne(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows[0], nil
}

func (r *modelRepo) find(ctx context.Context, dst model.List, filter interface{}) (model.List, error) {
	c := mongodoc.ModelConsumer{
		Rows: dst,
	}
	if err := r.client.Find(ctx, r.readFilter(filter), &c); err != nil {
		return nil, err
	}
	return c.Rows, nil
}

func (r *modelRepo) paginate(ctx context.Context, filter bson.M, pagination *usecase.Pagination) (model.List, *usecase.PageInfo, error) {
	var c mongodoc.ModelConsumer
	pageInfo, err := r.client.Paginate(ctx, r.readFilter(filter), pagination, &c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Rows, pageInfo, nil
}

// prepare filters the results and sorts them according to original ids list
func prepare(ids id.ModelIDList, rows model.List) model.List {
	res := make(model.List, 0, len(ids))
	for _, mId := range ids {
		for _, r := range rows {
			if r.ID() == mId {
				res = append(res, r)
				break
			}
		}
	}
	return res
}

func (r *modelRepo) readFilter(filter interface{}) interface{} {
	if r.f == nil {
		return filter
	}
	return applyWorkspaceFilter(filter, r.f.Readable)
}

func (r *modelRepo) writeFilter(filter interface{}) interface{} {
	if r.f == nil {
		return filter
	}
	return applyWorkspaceFilter(filter, r.f.Writable)
}
