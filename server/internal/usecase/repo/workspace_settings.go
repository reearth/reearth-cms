package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/workspace_settings"
	"github.com/reearth/reearthx/account/accountdomain"
)

type WorkspaceSettings interface {
	FindByIDs(context.Context, []accountdomain.WorkspaceID) ([]*workspace_settings.WorkspaceSettings, error)
	Save(context.Context, *workspace_settings.WorkspaceSettings) error
	Remove(context.Context, accountdomain.WorkspaceID) error
}
