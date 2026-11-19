package interactor

import (
	"context"
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
	tests := []struct {
		name        string
		hasProjects bool
		wantErr     error
	}{
		{
			name:        "delete when workspace has no projects",
			hasProjects: false,
			wantErr:     nil,
		},
		{
			name:        "delete rejected when workspace has projects",
			hasProjects: true,
			wantErr:     interfaces.ErrWorkspaceHasProjects,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()

			wid := accountdomain.NewWorkspaceID()
			op := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
					WritableWorkspaces: []accountdomain.WorkspaceID{wid},
					OwningWorkspaces:   []accountdomain.WorkspaceID{wid},
				},
			}

			ws := workspacesettings.New().ID(wid).MustBuild()
			require.NoError(t, db.WorkspaceSettings.Save(ctx, ws))
			if tc.hasProjects {
				p := project.New().NewID().Workspace(wid).MustBuild()
				require.NoError(t, db.Project.Save(ctx, p))
			}

			uc := NewWorkspaceSettings(db, nil)
			err := uc.Delete(ctx, interfaces.DeleteWorkspaceSettingsParam{ID: wid}, op)

			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
				// settings must be kept when deletion is rejected
				_, err = db.WorkspaceSettings.FindByID(ctx, wid)
				assert.NoError(t, err)
				return
			}

			assert.NoError(t, err)
			_, err = db.WorkspaceSettings.FindByID(ctx, wid)
			assert.Equal(t, rerror.ErrNotFound, err)
		})
	}
}
