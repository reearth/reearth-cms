package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type CreateWorkspaceSettingsParam struct {
	WorkspaceID accountdomain.WorkspaceID
}

type UpdateWorkspaceSettingsParam struct {
	WorkspaceID accountdomain.WorkspaceID
	Tiles       *workspacesettings.WorkspaceResourceList
	Terrains    *workspacesettings.WorkspaceResourceList
}

type DeleteWorkspaceSettingsParam struct {
	WorkspaceID accountdomain.WorkspaceID
}

type WorkspaceSettings interface {
	Fetch(context.Context, accountdomain.WorkspaceID, *usecase.Operator) (*workspacesettings.WorkspaceSettings, error)
	Create(context.Context, CreateWorkspaceSettingsParam, *usecase.Operator) (*workspacesettings.WorkspaceSettings, error)
	Update(context.Context, UpdateWorkspaceSettingsParam, *usecase.Operator) (*workspacesettings.WorkspaceSettings, error)
	Delete(context.Context, DeleteWorkspaceSettingsParam, *usecase.Operator) error
}
