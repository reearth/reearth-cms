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
	panic("not implemented")
}

func (ws *WorkspaceSettings) Create(ctx context.Context, inp interfaces.CreateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	panic("not implemented")
}

func (ws *WorkspaceSettings) Update(ctx context.Context, inp interfaces.UpdateWorkspaceSettingsParam, op *usecase.Operator) (result *workspacesettings.WorkspaceSettings, err error) {
	panic("not implemented")
}

func (ws *WorkspaceSettings) Delete(ctx context.Context, inp interfaces.DeleteWorkspaceSettingsParam, op *usecase.Operator) error {
	panic("not implemented")
}
