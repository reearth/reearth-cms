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
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestWorkspaceSettings_Delete(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	otherWid := accountdomain.NewWorkspaceID()
	errProject := errors.New("project error")

	owner := &usecase.Operator{AcOperator: &accountusecase.Operator{
		ReadableWorkspaces: accountdomain.WorkspaceIDList{wid},
		WritableWorkspaces: accountdomain.WorkspaceIDList{wid},
		OwningWorkspaces:   accountdomain.WorkspaceIDList{wid},
	}}
	reader := &usecase.Operator{AcOperator: &accountusecase.Operator{
		ReadableWorkspaces: accountdomain.WorkspaceIDList{wid},
	}}

	tests := []struct {
		name              string
		settingsSeeds     workspacesettings.List
		projectSeeds      project.List
		operator          *usecase.Operator
		projectErr        error
		wantErr           error
		wantSettingsExist bool
	}{
		{
			name:          "delete when workspace has no projects",
			settingsSeeds: workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			operator:      owner,
		},
		{
			name:          "delete not blocked by projects of another workspace",
			settingsSeeds: workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			projectSeeds:  project.List{project.New().NewID().Workspace(otherWid).MustBuild()},
			operator:      owner,
		},
		{
			name:              "rejected when workspace has projects",
			settingsSeeds:     workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			projectSeeds:      project.List{project.New().NewID().Workspace(wid).MustBuild()},
			operator:          owner,
			wantErr:           interfaces.ErrWorkspaceHasProjects,
			wantSettingsExist: true,
		},
		{
			name:              "project repository error keeps settings",
			settingsSeeds:     workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			operator:          owner,
			projectErr:        errProject,
			wantErr:           errProject,
			wantSettingsExist: true,
		},
		{
			name:              "operation denied for non-maintainer",
			settingsSeeds:     workspacesettings.List{workspacesettings.New().ID(wid).MustBuild()},
			projectSeeds:      project.List{project.New().NewID().Workspace(wid).MustBuild()},
			operator:          reader,
			wantErr:           interfaces.ErrOperationDenied,
			wantSettingsExist: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, s := range tc.settingsSeeds {
				require.NoError(t, db.WorkspaceSettings.Save(ctx, s))
			}
			for _, p := range tc.projectSeeds {
				require.NoError(t, db.Project.Save(ctx, p))
			}
			if tc.projectErr != nil {
				memory.SetProjectError(db.Project, tc.projectErr)
			}

			uc := NewWorkspaceSettings(db, nil)
			err := uc.Delete(ctx, interfaces.DeleteWorkspaceSettingsParam{ID: wid}, tc.operator)

			if tc.wantErr != nil {
				assert.ErrorIs(t, err, tc.wantErr)
			} else {
				assert.NoError(t, err)
			}

			_, err = db.WorkspaceSettings.FindByID(ctx, wid)
			if tc.wantSettingsExist {
				assert.NoError(t, err)
			} else {
				assert.ErrorIs(t, err, rerror.ErrNotFound)
			}
		})
	}
}
