package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/model"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type GroupLoader struct {
	usecase interfaces.Group
}

func NewGroupLoader(usecase interfaces.Group) *GroupLoader {
	return &GroupLoader{usecase: usecase}
}

func (c *GroupLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Group, []error) {
	gIds, err := util.TryMap(ids, gqlmodel.ToID[id.Group])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, gIds, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(gIds, func(id group.ID, i int) *gqlmodel.Group {
		g, ok := lo.Find(res, func(g *group.Group) bool {
			return g != nil && g.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToGroup(g)
	}), nil
}

func (c *GroupLoader) FindByProject(ctx context.Context, projectId gqlmodel.ID) ([]*gqlmodel.Group, error) {
	pId, err := gqlmodel.ToID[id.Project](projectId)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByProject(ctx, pId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(m *group.Group, _ int) *gqlmodel.Group {
		return gqlmodel.ToGroup(m)
	}), nil
}

func (c *GroupLoader) FindModelsByGroup(ctx context.Context, groupID gqlmodel.ID) ([]*gqlmodel.Model, error) {
	gId, err := gqlmodel.ToID[id.Group](groupID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindModelsByGroup(ctx, gId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(m *model.Model, _ int) *gqlmodel.Model {
		return gqlmodel.ToModel(m)
	}), nil
}

func (c *GroupLoader) FindByModel(ctx context.Context, modelID gqlmodel.ID) ([]*gqlmodel.Group, error) {
	mId, err := gqlmodel.ToID[id.Model](modelID)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByModel(ctx, mId, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return lo.Map(res, func(g *group.Group, _ int) *gqlmodel.Group {
		return gqlmodel.ToGroup(g)
	}), nil
}

func (c *GroupLoader) CheckKey(ctx context.Context, projectID gqlmodel.ID, key string) (*gqlmodel.KeyAvailability, error) {
	pId, err := gqlmodel.ToID[id.Project](projectID)
	if err != nil {
		return nil, err
	}

	ok, err := c.usecase.CheckKey(ctx, pId, key)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.KeyAvailability{Key: key, Available: ok}, nil
}
