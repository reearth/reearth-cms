package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
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

func (ws *WorkspaceSettings) Fetch(ctx context.Context, ids []accountdomain.WorkspaceID, op *usecase.Operator) (result []*workspace_settings.WorkspaceSettings, err error) {
	return ws.repos.WorkspaceSettings.FindByIDs(ctx, ids)
}

func (ws *WorkspaceSettings) Create(ctx context.Context, inp interfaces.CreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspace_settings.WorkspaceSettings, err error) {
	return Run1(ctx, op, ws.repos, Usecase().WithMaintainableWorkspaces(inp.WorkspaceID).Transaction(),
		func(ctx context.Context) (_ *workspace_settings.WorkspaceSettings, err error) {
			wsb := workspace_settings.New().
				Workspace(inp.WorkspaceID)

			if inp.Avatar != nil {
				wsb = wsb.Avatar(inp.Avatar)
			}

			// if len(p.RequestRoles) > 0 {
			// 	pb = pb.RequestRoles(p.RequestRoles)
			// } else {
			// 	pb = pb.RequestRoles([]workspace.Role{workspace.RoleOwner, workspace.RoleMaintainer, workspace.RoleWriter, workspace.RoleReader})
			// }

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

func (ws *WorkspaceSettings) Update(ctx context.Context, inp interfaces.UpdateWorkspaceSettingsParam, op *usecase.Operator) (result *workspace_settings.WorkspaceSettings, err error) {
	panic("not implemented")
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, wsid id.WorkspaceSettingsID, op *usecase.Operator) (result id.WorkspaceSettingsID, err error) {
	panic("not implemented")
}
