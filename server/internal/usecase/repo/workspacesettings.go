package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type WorkspaceSettings interface {
	FindByID(context.Context, accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error)
	FindByIDs(context.Context, []accountdomain.WorkspaceID) ([]*workspacesettings.WorkspaceSettings, error)
	FindByWorkspace(context.Context, accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error)
	Save(context.Context, *workspacesettings.WorkspaceSettings) error
	Remove(context.Context, accountdomain.WorkspaceID) error
}
