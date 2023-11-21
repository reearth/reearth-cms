package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/project"
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
	work, err := ws.repos.Workspace.FindByID(ctx, inp.WorkspaceID)
	if err != nil {
		return nil, err
	}
	return Run1(ctx, operator, ws.repos, Usecase().WithMaintainableWorkspaces(work.ID()).Transaction(),
		func(ctx context.Context) (_ *project.Project, err error) {
			if p.Name != nil {
				work.UpdateName(*p.Name)
			}

			if p.Description != nil {
				proj.UpdateDescription(*p.Description)
			}

			if err := ws.repos.Project.Save(ctx, proj); err != nil {
				return nil, err
			}

			return proj, nil
		})

}
