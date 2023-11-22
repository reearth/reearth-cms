package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type CreateWorkspaceSettingsParam struct {
	WorkspaceID accountdomain.WorkspaceID
}

type UpdateWorkspaceSettingsParam struct {
	ID          id.WorkspaceSettingsID
	WorkspaceID accountdomain.WorkspaceID
	Avatar      *string
	Tiles       *workspace_settings.WorkspaceResources
	Terrains    *workspace_settings.WorkspaceResources
}

type DeleteWorkspaceSettingsParam struct {
	ID          id.WorkspaceSettingsID
	WorkspaceID accountdomain.WorkspaceID
}

type WorkspaceSettings interface {
	Fetch(context.Context, accountdomain.WorkspaceID, *usecase.Operator) (*workspace_settings.WorkspaceSettings, error)
	Create(context.Context, CreateWorkspaceSettingsParam, *usecase.Operator) (*workspace_settings.WorkspaceSettings, error)
	Update(context.Context, UpdateWorkspaceSettingsParam, *usecase.Operator) (*workspace_settings.WorkspaceSettings, error)
	Delete(context.Context, DeleteWorkspaceSettingsParam, *usecase.Operator) (id.WorkspaceSettingsID, error)
}
