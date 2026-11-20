package interfaces

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var ErrWorkspaceHasProjects error = rerror.NewE(i18n.T("can't delete a workspace as it still has projects"))

type UpdateOrCreateWorkspaceSettingsParam struct {
	ID       accountdomain.WorkspaceID // same as workspace ID
	Tiles    *workspacesettings.ResourceList
	Terrains *workspacesettings.ResourceList
}

type DeleteWorkspaceSettingsParam struct {
	ID accountdomain.WorkspaceID // same as workspace ID
}

type WorkspaceSettings interface {
	Fetch(context.Context, accountdomain.WorkspaceIDList, *usecase.Operator) (workspacesettings.List, error)
	UpdateOrCreate(context.Context, UpdateOrCreateWorkspaceSettingsParam, *usecase.Operator) (*workspacesettings.WorkspaceSettings, error)
	Delete(context.Context, DeleteWorkspaceSettingsParam, *usecase.Operator) error
}
