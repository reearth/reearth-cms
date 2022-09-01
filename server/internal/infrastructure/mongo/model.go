package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"go.mongodb.org/mongo-driver/bson"
)

type modelRepo struct {
	client *mongox.ClientCollection
}

func NewModel(client *mongox.Client) repo.Model {
	r := &modelRepo{client: client.WithCollection("model")}
	r.init()
	return r
}

func (r *modelRepo) init() {
	i := r.client.CreateIndex(context.Background(), []string{"key", "project", "workspace"}, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "model", i)
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

	res, err := r.find(ctx, bson.M{
		"id": bson.M{
			"$in": ids.Strings(),
		},
	})
	if err != nil {
		return nil, err
	}
	return prepare(ids, res), nil
}

func (r *modelRepo) FindByProject(ctx context.Context, pId id.ProjectID, pagination *usecasex.Pagination) (model.List, *usecasex.PageInfo, error) {
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
	doc, mId := mongodoc.NewModel(model)
	return r.client.SaveOne(ctx, mId, doc)
}

func (r *modelRepo) Remove(ctx context.Context, modelID id.ModelID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": modelID.String()})
}

func (r *modelRepo) findOne(ctx context.Context, filter any) (*model.Model, error) {
	c := mongodoc.NewModelConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *modelRepo) find(ctx context.Context, filter any) (model.List, error) {
	c := mongodoc.NewModelConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}

func (r *modelRepo) paginate(ctx context.Context, filter bson.M, pagination *usecasex.Pagination) (model.List, *usecasex.PageInfo, error) {
	c := mongodoc.NewModelConsumer()
	pageInfo, err := r.client.Paginate(ctx, filter, nil, nil, pagination, c)
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}
	return c.Result, pageInfo, nil
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
