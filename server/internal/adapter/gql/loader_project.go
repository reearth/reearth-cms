package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ProjectLoader struct {
	usecase interfaces.Project
}

func NewProjectLoader(usecase interfaces.Project) *ProjectLoader {
	return &ProjectLoader{usecase: usecase}
}

func (c *ProjectLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Project, []error) {
	pIDs, err := util.TryMap(ids, gqlmodel.ToID[id.Project])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, pIDs, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(pIDs, func(id project.ID, _ int) *gqlmodel.Project {
		p, ok := lo.Find(res, func(p *project.Project) bool {
			return p != nil && p.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToProject(p)

	}), nil
}

func (c *ProjectLoader) FindByWorkspace(ctx context.Context, workspaceId gqlmodel.ID, k *string, s *gqlmodel.Sort, p *gqlmodel.Pagination) (*gqlmodel.ProjectConnection, error) {
	wid, err := gqlmodel.ToID[accountdomain.Workspace](workspaceId)
	if err != nil {
		return nil, err
	}

	res, pi, err := c.usecase.FindByWorkspace(ctx, wid, &interfaces.ProjectFilter{
		Visibility: nil,
		Keyword:    k,
		Sort:       s.Into(),
		Pagination: p.Into(),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	edges := make([]*gqlmodel.ProjectEdge, 0, len(res))
	nodes := make([]*gqlmodel.Project, 0, len(res))
	for _, p := range res {
		prj := gqlmodel.ToProject(p)
		edges = append(edges, &gqlmodel.ProjectEdge{
			Node:   prj,
			Cursor: usecasex.Cursor(prj.ID),
		})
		nodes = append(nodes, prj)
	}

	return &gqlmodel.ProjectConnection{
		Edges:      edges,
		Nodes:      nodes,
		PageInfo:   gqlmodel.ToPageInfo(pi),
		TotalCount: int(pi.TotalCount),
	}, nil
}

func (c *ProjectLoader) CheckAlias(ctx context.Context, alias string) (*gqlmodel.ProjectAliasAvailability, error) {
	ok, err := c.usecase.CheckAlias(ctx, alias)
	if err != nil {
		return nil, err
	}

	return &gqlmodel.ProjectAliasAvailability{Alias: alias, Available: ok}, nil
}

func (c *ProjectLoader) CheckWorkspaceProjectLimits(ctx context.Context, workspaceID gqlmodel.ID) (*gqlmodel.WorkspaceProjectLimits, error) {
	wid, err := gqlmodel.ToID[accountdomain.Workspace](workspaceID)
	if err != nil {
		return nil, err
	}
	ok, err := c.usecase.CheckProjectLimits(ctx, wid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.WorkspaceProjectLimits{
		PublicProjectsAllowed:  ok.PublicProjectsAllowed,
		PrivateProjectsAllowed: ok.PrivateProjectsAllowed,
	}, nil
}
