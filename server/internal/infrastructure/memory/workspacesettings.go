package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/mongox"
	"github.com/reearth/reearthx/util"
)

type WorkspaceSettingsRepo struct {
	data *util.SyncMap[id.ViewID, *view.View]
	f    repo.WorkspaceFilter
	err  error
}

func NewWorkspaceSettings(client *mongox.Client) repo.WorkspaceSettings {
	return &WorkspaceSettingsRepo{
		data: &util.SyncMap[id.ViewID, *view.View]{},
	}
}

func (r *WorkspaceSettingsRepo) Init() error {
	panic("implement me")
}

func (r *WorkspaceSettingsRepo) FindByID(ctx context.Context, id accountdomain.WorkspaceID) (*workspacesettings.WorkspaceSettings, error) {
	panic("implement me")
}

func (r *WorkspaceSettingsRepo) FindByIDs(ctx context.Context, ids []accountdomain.WorkspaceID) ([]*workspacesettings.WorkspaceSettings, error) {
	panic("implement me")
}

func (r *WorkspaceSettingsRepo) Save(ctx context.Context, ws *workspacesettings.WorkspaceSettings) error {
	panic("implement me")
}

func (r *WorkspaceSettingsRepo) Remove(ctx context.Context, id accountdomain.WorkspaceID) error {
	panic("implement me")
}