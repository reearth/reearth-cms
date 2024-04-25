package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase/accountinterfaces"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type WorkspaceLoader struct {
	usecase accountinterfaces.Workspace
}

func NewWorkspaceLoader(usecase accountinterfaces.Workspace) *WorkspaceLoader {
	return &WorkspaceLoader{usecase: usecase}
}

func (c *WorkspaceLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Workspace, []error) {
	wIDs, err := util.TryMap(ids, gqlmodel.ToID[accountdomain.Workspace])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.Fetch(ctx, wIDs, getAcOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(wIDs, func(id accountdomain.WorkspaceID, _ int) *gqlmodel.Workspace {
		w, ok := lo.Find(res, func(w *workspace.Workspace) bool {
			return w != nil && w.ID() == id
		})
		if !ok {
			return nil
		}
		return gqlmodel.ToWorkspace(w)
	}), nil
}

func (c *WorkspaceLoader) FindByUser(ctx context.Context, uid gqlmodel.ID) ([]*gqlmodel.Workspace, error) {
	userid, err := gqlmodel.ToID[accountdomain.User](uid)
	if err != nil {
		return nil, err
	}

	res, err := c.usecase.FindByUser(ctx, userid, getAcOperator(ctx))
	if err != nil {
		return nil, err
	}
	workspaces := make([]*gqlmodel.Workspace, 0, len(res))
	for _, t := range res {
		workspaces = append(workspaces, gqlmodel.ToWorkspace(t))
	}
	return workspaces, nil
}
