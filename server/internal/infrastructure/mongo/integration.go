package mongo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/mongo/mongodoc"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integration"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
)

type integrationRepo struct {
	client *mongox.ClientCollection
}

func NewIntegration(client *mongox.Client) repo.Integration {
	r := &integrationRepo{client: client.WithCollection("integration")}
	r.init()
	return r
}

func (r *integrationRepo) init() {
	i := r.client.CreateIndex(context.Background(), nil, []string{"id"})
	if len(i) > 0 {
		log.Infof("mongo: %s: index created: %s", "integration", i)
	}
}

func (r *integrationRepo) FindByID(ctx context.Context, integrationID id.IntegrationID) (*integration.Integration, error) {
	return r.findOne(ctx, bson.M{
		"id": integrationID.String(),
	})
}

func (r *integrationRepo) FindByIDs(ctx context.Context, ids id.IntegrationIDList) (integration.List, error) {
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

	// prepare filters the results and sorts them according to original ids list
	return util.Map(ids, func(sid id.IntegrationID) *integration.Integration {
		s, ok := lo.Find(res, func(s *integration.Integration) bool {
			return s.ID() == sid
		})
		if !ok {
			return nil
		}
		return s
	}), nil
}

func (r *integrationRepo) FindByUser(ctx context.Context, userID id.UserID) (integration.List, error) {
	return r.find(ctx, bson.M{
		"developer": userID.String(),
	})
}

func (r *integrationRepo) Save(ctx context.Context, integration *integration.Integration) error {
	doc, sId := mongodoc.NewIntegration(integration)
	return r.client.SaveOne(ctx, sId, doc)
}

func (r *integrationRepo) Remove(ctx context.Context, integrationID id.IntegrationID) error {
	return r.client.RemoveOne(ctx, bson.M{"id": integrationID.String()})
}

func (r *integrationRepo) findOne(ctx context.Context, filter any) (*integration.Integration, error) {
	c := mongodoc.NewIntegrationConsumer()
	if err := r.client.FindOne(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result[0], nil
}

func (r *integrationRepo) find(ctx context.Context, filter any) (integration.List, error) {
	c := mongodoc.NewIntegrationConsumer()
	if err := r.client.Find(ctx, filter, c); err != nil {
		return nil, err
	}
	return c.Result, nil
}
