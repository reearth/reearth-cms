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
	tests := []struct {
		name         string
		personal     bool
		hasProjects  bool
		hasSettings  bool
		maintainer   bool
		wantErr      error
		wantDeleted  bool
		wantSettings bool
	}{
		{
			name:        "delete workspace and its settings",
			hasSettings: true,
			maintainer:  true,
			wantDeleted: true,
		},
		{
			name:        "delete workspace without settings",
			maintainer:  true,
			wantDeleted: true,
		},
		{
			name:         "rejected when workspace has projects",
			hasProjects:  true,
			hasSettings:  true,
			maintainer:   true,
			wantErr:      interfaces.ErrWorkspaceHasProjects,
			wantSettings: true,
		},
		{
			name:         "personal workspace keeps its settings",
			personal:     true,
			hasSettings:  true,
			maintainer:   true,
			wantErr:      workspace.ErrCannotModifyPersonalWorkspace,
			wantSettings: true,
		},
		{
			name:         "operation denied for non-maintainer",
			hasSettings:  true,
			wantErr:      interfaces.ErrOperationDenied,
			wantSettings: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			adb := accountmemory.New()

			ws := workspace.New().NewID().Name("ws").Personal(tc.personal).MustBuild()
			wid := ws.ID()
			require.NoError(t, adb.Workspace.Save(ctx, ws))

			if tc.hasSettings {
				require.NoError(t, db.WorkspaceSettings.Save(ctx, workspacesettings.New().ID(wid).MustBuild()))
			}
			if tc.hasProjects {
				require.NoError(t, db.Project.Save(ctx, project.New().NewID().Workspace(wid).MustBuild()))
			}

			acOp := &accountusecase.Operator{
				User:               new(user.NewID()),
				ReadableWorkspaces: accountdomain.WorkspaceIDList{wid},
			}
			if tc.maintainer {
				acOp.OwningWorkspaces = accountdomain.WorkspaceIDList{wid}
			}
			op := &usecase.Operator{AcOperator: acOp}

			uc := NewWorkspaceDeleter(db, nil, accountinteractor.NewWorkspace(adb, nil))
			err := uc.Delete(ctx, wid, op)

			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
			} else {
				assert.NoError(t, err)
			}

			_, err = adb.Workspace.FindByID(ctx, wid)
			if tc.wantDeleted {
				assert.Equal(t, rerror.ErrNotFound, err)
			} else {
				assert.NoError(t, err)
			}

			_, err = db.WorkspaceSettings.FindByID(ctx, wid)
			if tc.wantSettings {
				assert.NoError(t, err)
			} else {
				assert.Equal(t, rerror.ErrNotFound, err)
			}
		})
	}
}
