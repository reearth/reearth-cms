package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type WorkspaceSettings interface {
	FindByID(context.Context, id.WorkspaceSettingsID) (*workspace_settings.WorkspaceSettings, error)
	FindByIDs(context.Context, id.WorkspaceSettingsIDList) ([]*workspace_settings.WorkspaceSettings, error)
	FindByWorkspace(context.Context, accountdomain.WorkspaceID) (*workspace_settings.WorkspaceSettings, error)
	Save(context.Context, *workspace_settings.WorkspaceSettings) error
	Remove(context.Context, accountdomain.WorkspaceID) error
}
