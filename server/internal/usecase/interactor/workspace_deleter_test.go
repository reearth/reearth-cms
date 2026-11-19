package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/workspacesettings"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountinfrastructure/accountmemory"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/account/accountusecase/accountinteractor"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestWorkspaceDeleter_Delete(t *testing.T) {
	ws := workspace.New().NewID().Name("ws").MustBuild()
	personalWs := workspace.New().NewID().Name("personal").Personal(true).MustBuild()
	wid := ws.ID()
	personalWid := personalWs.ID()

	owner := func(wids ...accountdomain.WorkspaceID) *usecase.Operator {
		return &usecase.Operator{AcOperator: &accountusecase.Operator{
			User:               new(user.NewID()),
			ReadableWorkspaces: wids,
			OwningWorkspaces:   wids,
		}}
	}
	errProject := errors.New("project error")
	errSettings := errors.New("settings error")
	reader := &usecase.Operator{AcOperator: &accountusecase.Operator{
		User:               new(user.NewID()),
		ReadableWorkspaces: accountdomain.WorkspaceIDList{wid},
	}}

	tests := []struct {
		name               string
		workspaceSeeds     workspace.List
		settingsSeeds      workspacesettings.List
		projectSeeds       project.List
		id                 accountdomain.WorkspaceID
		operator           *usecase.Operator
		projectErr         error
		settingsErr        error
		wantErr            error
		wantWorkspaceExist bool
		wantSettingsExist  bool
	}{
		{
			name:           "delete workspace and its settings",
			workspaceSeeds: workspace.List{ws},
			settingsSeeds:  workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			id:             wid,
			operator:       owner(wid),
		},
		{
			name:           "delete workspace without settings",
			workspaceSeeds: workspace.List{ws},
			id:             wid,
			operator:       owner(wid),
		},
		{
			name:               "rejected when workspace has projects",
			workspaceSeeds:     workspace.List{ws},
			settingsSeeds:      workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			projectSeeds:       project.List{project.New().NewID().Workspace(wid).MustBuild()},
			id:                 wid,
			operator:           owner(wid),
			wantErr:            interfaces.ErrWorkspaceHasProjects,
			wantWorkspaceExist: true,
			wantSettingsExist:  true,
		},
		{
			name:               "personal workspace keeps its settings",
			workspaceSeeds:     workspace.List{personalWs},
			settingsSeeds:      workspacesettings.List{workspacesettings.New().ID(personalWid).MustBuild()},
			id:                 personalWid,
			operator:           owner(personalWid),
			wantErr:            workspace.ErrCannotModifyPersonalWorkspace,
			wantWorkspaceExist: true,
			wantSettingsExist:  true,
		},
		{
			name:           "delete not blocked by projects of another workspace",
			workspaceSeeds: workspace.List{ws},
			settingsSeeds:  workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			projectSeeds:   project.List{project.New().NewID().Workspace(accountdomain.NewWorkspaceID()).MustBuild()},
			id:             wid,
			operator:       owner(wid),
		},
		{
			name:               "project repository error keeps everything",
			workspaceSeeds:     workspace.List{ws},
			settingsSeeds:      workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			id:                 wid,
			operator:           owner(wid),
			projectErr:         errProject,
			wantErr:            errProject,
			wantWorkspaceExist: true,
			wantSettingsExist:  true,
		},
		{
			// settings are removed last, so a failure there must not keep the workspace
			name:           "settings removal error after the workspace is removed",
			workspaceSeeds: workspace.List{ws},
			settingsSeeds:  workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			id:             wid,
			operator:       owner(wid),
			settingsErr:    errSettings,
			wantErr:        errSettings,
		},
		{
			name:               "operation denied for non-maintainer",
			workspaceSeeds:     workspace.List{ws},
			settingsSeeds:      workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			id:                 wid,
			operator:           reader,
			wantErr:            interfaces.ErrOperationDenied,
			wantWorkspaceExist: true,
			wantSettingsExist:  true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			adb := accountmemory.New()
			for _, w := range tc.workspaceSeeds {
				require.NoError(t, adb.Workspace.Save(ctx, w))
			}
			for _, s := range tc.settingsSeeds {
				require.NoError(t, db.WorkspaceSettings.Save(ctx, s))
			}
			for _, p := range tc.projectSeeds {
				require.NoError(t, db.Project.Save(ctx, p))
			}
			if tc.projectErr != nil {
				memory.SetProjectError(db.Project, tc.projectErr)
			}
			if tc.settingsErr != nil {
				memory.SetWorkspaceSettingsError(db.WorkspaceSettings, tc.settingsErr)
			}

			uc := NewWorkspaceDeleter(db, nil, accountinteractor.NewWorkspace(adb, nil))
			err := uc.Delete(ctx, tc.id, tc.operator)

			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				assert.NoError(t, err)
			}

			_, err = adb.Workspace.FindByID(ctx, tc.id)
			if tc.wantWorkspaceExist {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, rerror.ErrNotFound)
			}

			if tc.settingsErr != nil {
				// the settings repository is mocked to fail, so it cannot be inspected
				return
			}
			_, err = db.WorkspaceSettings.FindByID(ctx, tc.id)
			if tc.wantSettingsExist {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, rerror.ErrNotFound)
			}
		})
	}
}
