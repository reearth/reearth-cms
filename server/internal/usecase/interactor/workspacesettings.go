package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
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

func (ws *WorkspaceSettings) Fetch(ctx context.Context, wid accountdomain.WorkspaceID, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	return ws.repos.WorkspaceSettings.FindByWorkspace(ctx, wid)
}

func (ws *WorkspaceSettings) Create(ctx context.Context, inp interfaces.CreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *workspacesettings.WorkspaceSettings, err error) {
			wsb := workspacesettings.New().
				NewID().
				Workspace(inp.WorkspaceID)

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
	work, err := ws.repos.WorkspaceSettings.FindByWorkspace(ctx, inp.WorkspaceID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *workspacesettings.WorkspaceSettings, err error) {
			if inp.Avatar != nil {
				work.SetAvatar(inp.Avatar)
			}
			if inp.Tiles != nil {
				work.SetTiles(inp.Tiles)
			}
			if inp.Terrains != nil {
				work.SetTiles(inp.Terrains)
			}
			if err := ws.repos.WorkspaceSettings.Save(ctx, work); err != nil {
				return nil, err
			}
			return work, nil
		})
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, inp interfaces.DeleteWorkspaceSettingsParam, op *usecase.Operator) (id.WorkspaceSettingsID, error) {
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.WorkspaceID).Transaction(),
		func(ctx context.Context) (id.WorkspaceSettingsID, error) {
			return inp.ID, ws.repos.WorkspaceSettings.Remove(ctx, inp.ID)
		})
}
