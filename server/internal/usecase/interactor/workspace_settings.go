package interactor

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
)

type WorkspaceSettings struct {
	repos       *repo.Container
	gateways    *gateway.Container
	ignoreEvent bool
}

func NewWorkspaceSettings(r *repo.Container, g *gateway.Container) interfaces.WorkspaceSettings {
	return &WorkspaceSettings{
		repos:    r,
		gateways: g,
	}
}

func (ws *WorkspaceSettings) Create(ctx context.Context, inp interfaces.CreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspace_settings.WorkspaceSettings, err error) {
	panic("not implemented")
}

func (ws *WorkspaceSettings) Update(ctx context.Context, inp interfaces.UpdateWorkspaceSettingsParam, op *usecase.Operator) (result *workspace_settings.WorkspaceSettings, err error) {
	panic("not implemented")
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, wsid id.WorkspaceSettingsID, op *usecase.Operator) (result id.WorkspaceSettingsID, err error) {
	panic("not implemented")
}

