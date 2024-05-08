package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ModelLoader struct {
	usecase interfaces.Model
}

func NewModelLoader(usecase interfaces.Model) *ModelLoader {
	return &ModelLoader{usecase: usecase}
}

func (c *ModelLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Model, []error) {
	mIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Model])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, mIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(mIDs, func(id model.ID, i int) *gqlmodel.Model {
		m, ok := lo.Find(res, func(m *model.Model) bool {
			return m != nil && m.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToModel(m)
	}), nil
}

func (c *ModelLoader) FindByProject(ctx context.Context, projectId gqlmodel.ID, p *gqlmodel.Pagination) (*gqlmodel.ModelConnection, error) {
	pId, err := gqlmodel.ToID[id.Project](projectId)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindByProject(ctx, pId, p.Into(), getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ModelEdge, 0, len(res))
	nodes := make([]*gqlmodel.Model, 0, len(res))
	for _, r := range res {
		m := gqlmodel.ToModel(r)
		edges = append(edges, &gqlmodel.ModelEdge{
			Node:   m,
			Cursor: usecasex.Cursor(m.ID),
		})
		nodes = append(nodes, m)
	}

	return &gqlmodel.ModelConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ModelLoader) CheckKey(ctx context.Context, projectID gqlmodel.ID, key string) (*gqlmodel.KeyAvailability, error) {
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
