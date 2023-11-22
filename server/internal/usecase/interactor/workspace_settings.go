package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
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

func (ws *WorkspaceSettings) Update(ctx context.Context, inp interfaces.UpdateWorkspaceSettingsParam, op *usecase.Operator) (result *workspace_settings.WorkspaceSettings, err error) {
	work, err := ws.repos.WorkspaceSettings.FindByID(ctx, inp.WorkspaceID)
	if err != nil {
		return nil, err
	}

	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *workspace_settings.WorkspaceSettings, err error) {
			if inp.Avatar != nil {
				work.UpdateAvatar(inp.Avatar)
			}

			if err := ws.repos.WorkspaceSettings.Save(ctx, work); err != nil {
				return nil, err
			}

			return work, nil
		})

}
