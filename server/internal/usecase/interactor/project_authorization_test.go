package interactor

import (
	"context"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestProject_FindByIDOrAlias_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers (no shared mutable objects)
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
	}

	tests := []struct {
		name          string
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       bool
	}{
		{
			name:          "Cerbos allows read",
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       false,
		},
		{
			name:          "Cerbos denies read",
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       true,
		},
		{
			name:          "Cerbos returns error",
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			// Create fresh objects per subtest to avoid shared-pointer races
			ws := workspace.New().ID(wid).MustBuild()
			proj := project.New().ID(pid).Workspace(wid).Name("Test Project").MustBuild()

			// Setup database
			db := memory.New()
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)
			err = db.Project.Save(ctx, proj)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceProject,
						ID:   pid.String(),
					},
					Action: rbac.ActionRead,
				}
				mockAuth.EXPECT().
					CheckPermission(gomock.Any(), expectedInput).
					Return(tt.cerbosAllowed, tt.cerbosError).
					Times(1)
			}

			// Setup gateway container
			gateways := &gateway.Container{
				Authorization: mockAuth,
			}

			// Create interactor with authorization
			projectUC := NewProject(db, gateways)

			// Execute
			got, err := projectUC.FindByIDOrAlias(ctx, accountdomain.WorkspaceIDOrAlias(wid.String()), project.IDOrAlias(pid.String()), operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, pid, got.ID())
		})
	}
}

func TestProject_Create_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
	}

	projectName := "Test Project"
	param := interfaces.CreateProjectParam{
		WorkspaceID: wid,
		Name:        &projectName,
	}

	tests := []struct {
		name          string
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       bool
	}{
		{
			name:          "Cerbos allows create",
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       false,
		},
		{
			name:          "Cerbos denies create",
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       true,
		},
		{
			name:          "Cerbos returns error",
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			// Create fresh workspace per subtest to avoid shared-pointer races
			ws := workspace.New().ID(wid).MustBuild()

			// Setup database
			db := memory.New()
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceProject,
						ID:   wid.String(), // Workspace-level check for create
					},
					Action: rbac.ActionCreate,
				}
				mockAuth.EXPECT().
					CheckPermission(gomock.Any(), expectedInput).
					Return(tt.cerbosAllowed, tt.cerbosError).
					Times(1)
			}

			// Setup gateway container
			gateways := &gateway.Container{
				Authorization: mockAuth,
			}

			// Create interactor with authorization
			projectUC := NewProject(db, gateways)

			// Execute
			got, err := projectUC.Create(ctx, param, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, projectName, got.Name())
		})
	}
}

func TestProject_Update_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects: []id.ProjectID{pid},
	}

	newName := "Updated Name"
	param := interfaces.UpdateProjectParam{
		ID:   pid,
		Name: &newName,
	}

	tests := []struct {
		name          string
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       bool
	}{
		{
			name:          "Cerbos allows update",
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       false,
		},
		{
			name:          "Cerbos denies update",
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       true,
		},
		{
			name:          "Cerbos returns error",
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			// Create fresh objects per subtest to avoid shared-pointer races
			// (interactor mutates the project in-place via UpdateName/SetUpdatedAt)
			ws := workspace.New().ID(wid).MustBuild()
			proj := project.New().ID(pid).Workspace(wid).Name("Original Name").MustBuild()

			// Setup database
			db := memory.New()
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)
			err = db.Project.Save(ctx, proj)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceProject,
						ID:   pid.String(),
					},
					Action: rbac.ActionUpdate,
				}
				mockAuth.EXPECT().
					CheckPermission(gomock.Any(), expectedInput).
					Return(tt.cerbosAllowed, tt.cerbosError).
					Times(1)
			}

			// Setup gateway container
			gateways := &gateway.Container{
				Authorization: mockAuth,
			}

			// Create interactor with authorization
			projectUC := NewProject(db, gateways)

			// Execute
			got, err := projectUC.Update(ctx, param, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, newName, got.Name())
		})
	}
}

func TestProject_Delete_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects: []id.ProjectID{pid},
	}

	tests := []struct {
		name          string
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       bool
	}{
		{
			name:          "Cerbos allows delete",
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       false,
		},
		{
			name:          "Cerbos denies delete",
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       true,
		},
		{
			name:          "Cerbos returns error",
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			// Create fresh objects per subtest to avoid shared-pointer races
			ws := workspace.New().ID(wid).MustBuild()
			proj := project.New().ID(pid).Workspace(wid).Name("Test Project").MustBuild()

			// Setup database
			db := memory.New()
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)
			err = db.Project.Save(ctx, proj)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceProject,
						ID:   pid.String(),
					},
					Action: rbac.ActionDelete,
				}
				mockAuth.EXPECT().
					CheckPermission(gomock.Any(), expectedInput).
					Return(tt.cerbosAllowed, tt.cerbosError).
					Times(1)
			}

			// Setup gateway container
			gateways := &gateway.Container{
				Authorization: mockAuth,
			}

			// Create interactor with authorization
			projectUC := NewProject(db, gateways)

			// Execute
			err = projectUC.Delete(ctx, pid, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)

			// Verify project was deleted
			_, err = db.Project.FindByID(ctx, pid)
			assert.Error(t, err) // Should not find the deleted project
		})
	}
}

func TestProject_CreateAPIKey_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:                   lo.ToPtr(uid),
			ReadableWorkspaces:     []accountdomain.WorkspaceID{wid},
			WritableWorkspaces:     []accountdomain.WorkspaceID{wid},
			MaintainableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		MaintainableProjects: []id.ProjectID{pid},
	}

	param := interfaces.CreateAPITokenParam{
		ProjectID:   pid,
		Name:        "Test API Key",
		Description: "Test Description",
	}

	tests := []struct {
		name          string
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       bool
	}{
		{
			name:          "Cerbos allows API key creation",
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       false,
		},
		{
			name:          "Cerbos denies API key creation",
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       true,
		},
		{
			name:          "Cerbos returns error",
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			ctrl := gomock.NewController(t)
			defer ctrl.Finish()

			// Create fresh objects per subtest to avoid shared-pointer races
			// (interactor mutates proj via SetAccessibility/UpdateAPIKey)
			ws := workspace.New().ID(wid).MustBuild()
			visibility := project.VisibilityPrivate
			proj := project.New().
				ID(pid).
				Workspace(wid).
				Name("Test Project").
				Accessibility(project.NewAccessibility(visibility, nil, nil)).
				MustBuild()

			// Setup database
			db := memory.New()
			err := db.Workspace.Save(ctx, ws)
			assert.NoError(t, err)
			err = db.Project.Save(ctx, proj)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceProject,
						ID:   pid.String(),
					},
					Action: rbac.ActionManageAPIKeys,
				}
				mockAuth.EXPECT().
					CheckPermission(gomock.Any(), expectedInput).
					Return(tt.cerbosAllowed, tt.cerbosError).
					Times(1)
			}

			// Setup gateway container
			gateways := &gateway.Container{
				Authorization: mockAuth,
			}

			// Create interactor with authorization
			projectUC := NewProject(db, gateways)

			// Execute
			gotProject, gotKeyID, err := projectUC.CreateAPIKey(ctx, param, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, gotProject)
				assert.Nil(t, gotKeyID)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, gotProject)
			assert.NotNil(t, gotKeyID)
		})
	}
}

func TestProject_NilSafeAuthorization(t *testing.T) {
	t.Parallel()

	// Setup test data
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	uid := user.NewID()

	ws := workspace.New().ID(wid).MustBuild()
	proj := project.New().ID(pid).Workspace(wid).Name("Test Project").MustBuild()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects: []id.ProjectID{pid},
	}

	ctx := context.Background()
	db := memory.New()
	err := db.Workspace.Save(ctx, ws)
	assert.NoError(t, err)
	err = db.Project.Save(ctx, proj)
	assert.NoError(t, err)

	// Create interactor WITHOUT authorization (nil gateway)
	projectUC := NewProject(db, nil)

	t.Run("FindByIDOrAlias works without authorization", func(t *testing.T) {
		got, err := projectUC.FindByIDOrAlias(ctx, accountdomain.WorkspaceIDOrAlias(wid.String()), project.IDOrAlias(pid.String()), operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, proj, got)
	})

	t.Run("Create works without authorization", func(t *testing.T) {
		projectName := "New Project"
		param := interfaces.CreateProjectParam{
			WorkspaceID: wid,
			Name:        &projectName,
		}

		got, err := projectUC.Create(ctx, param, operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, projectName, got.Name())
	})

	t.Run("Update works without authorization", func(t *testing.T) {
		newName := "Updated Project Name"
		param := interfaces.UpdateProjectParam{
			ID:   pid,
			Name: &newName,
		}

		got, err := projectUC.Update(ctx, param, operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, newName, got.Name())
	})

	t.Run("Delete works without authorization", func(t *testing.T) {
		// Create a new project to delete
		newProject := project.New().NewID().Workspace(wid).Name("To Delete").MustBuild()
		err = db.Project.Save(ctx, newProject)
		assert.NoError(t, err)

		err = projectUC.Delete(ctx, newProject.ID(), operator)
		assert.NoError(t, err)

		// Verify deleted
		_, err = db.Project.FindByID(ctx, newProject.ID())
		assert.Error(t, err)
	})
}
