package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type UpdateWorkspaceSettingsParam struct {
	WorkspaceID accountdomain.WorkspaceID
	Avatar      *string
	tiles       *workspace_settings.WorkspaceResources
	terrains    *workspace_settings.WorkspaceResources

}

type WorkspaceSettings interface {
	Fetch(context.Context, []accountdomain.WorkspaceID, *usecase.Operator) ([]*workspace_settings.WorkspaceSettings, error)
	Update(context.Context, UpdateWorkspaceSettingsParam, *usecase.Operator) (*workspace_settings.WorkspaceSettings, error)
}
