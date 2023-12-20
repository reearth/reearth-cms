package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type WorkspaceSettings struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewWorkspaceSettings(r *repo.Container, g *gateway.Container) interfaces.WorkspaceSettings {
	return &WorkspaceSettings{
		repos:    r,
		gateways: g,
	}
}

func (ws *WorkspaceSettings) Fetch(ctx context.Context, wid accountdomain.WorkspaceIDList, op *usecase.Operator) (result workspacesettings.List, err error) {
	return ws.repos.WorkspaceSettings.FindByIDs(ctx, wid)
}

func (ws *WorkspaceSettings) Create(ctx context.Context, inp interfaces.CreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.ID).Transaction(),
		func(ctx context.Context) (_ *workspacesettings.WorkspaceSettings, err error) {
			wsb := workspacesettings.New().
				ID(inp.ID)

			work, err := wsb.Build()
			if err != nil {
				return nil, err
			}
			err = ws.repos.WorkspaceSettings.Save(ctx, work)
			if err != nil {
				return nil, err
			}
			return work, nil
		})
}

func (ws *WorkspaceSettings) Update(ctx context.Context, inp interfaces.UpdateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	work, err := ws.repos.WorkspaceSettings.FindByID(ctx, inp.ID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.ID).Transaction(),
		func(ctx context.Context) (_ *workspacesettings.WorkspaceSettings, err error) {
			if inp.Tiles != nil {
				work.SetTiles(inp.Tiles)
			}
			if inp.Terrains != nil {
				work.SetTerrains(inp.Terrains)
			}
			if err := ws.repos.WorkspaceSettings.Save(ctx, work); err != nil {
				return nil, err
			}
			return work, nil
		})
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, inp interfaces.DeleteWorkspaceSettingsParam, op *usecase.Operator) error {
	return Run0(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.ID).Transaction(),
		func(ctx context.Context) error {
			return ws.repos.WorkspaceSettings.Remove(ctx, inp.ID)
		})
}
