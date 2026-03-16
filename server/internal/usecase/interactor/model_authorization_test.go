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
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestModel_FindByID_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers (no shared mutable objects)
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
	}

	tests := []struct {
		name          string
		modelID       id.ModelID
		cerbosAllowed bool
		cerbosError   error
		expectCerbos  bool
		wantErr       error
	}{
		{
			name:          "Cerbos allows read",
			modelID:       mid,
			cerbosAllowed: true,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       nil,
		},
		{
			name:          "Cerbos denies read",
			modelID:       mid,
			cerbosAllowed: false,
			cerbosError:   nil,
			expectCerbos:  true,
			wantErr:       interfaces.ErrOperationDenied,
		},
		{
			name:          "Cerbos returns error",
			modelID:       mid,
			cerbosAllowed: false,
			cerbosError:   errors.New("cerbos connection error"),
			expectCerbos:  true,
			wantErr:       errors.New("cerbos connection error"),
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
			proj := project.New().ID(pid).Workspace(wid).MustBuild()
			sch := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
			mdl := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()

			// Setup database
			db := memory.New()
			err := db.Project.Save(ctx, proj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, sch)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, mdl)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceModel,
						ID:   tt.modelID.String(),
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
			modelUC := NewModel(db, gateways)

			// Execute
			got, err := modelUC.FindByID(ctx, tt.modelID, operator)

			// Assert
			if tt.wantErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.wantErr.Error(), err.Error())
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, mid, got.ID())
		})
	}
}

func TestModel_Create_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects:     []id.ProjectID{pid},
		MaintainableProjects: []id.ProjectID{pid},
	}

	param := interfaces.CreateModelParam{
		ProjectId:   pid,
		Name:        lo.ToPtr("Test Model"),
		Description: lo.ToPtr("Test Description"),
		Key:         lo.ToPtr("test-model"),
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

			// Create fresh objects per subtest to avoid shared-pointer races
			proj := project.New().ID(pid).Workspace(wid).MustBuild()
			sch := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()

			// Setup database
			db := memory.New()
			err := db.Project.Save(ctx, proj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, sch)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceModel,
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
			modelUC := NewModel(db, gateways)

			// Execute
			got, err := modelUC.Create(ctx, param, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				return
			}

			assert.NoError(t, err)
			assert.NotNil(t, got)
			assert.Equal(t, *param.Name, got.Name())
			assert.Equal(t, *param.Key, got.Key().String())
		})
	}
}

func TestModel_Update_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects:     []id.ProjectID{pid},
		MaintainableProjects: []id.ProjectID{pid},
	}

	newName := "Updated Name"
	param := interfaces.UpdateModelParam{
		ModelID: mid,
		Name:    &newName,
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
			// (interactor mutates the model in-place via UpdateName/SetUpdatedAt)
			proj := project.New().ID(pid).Workspace(wid).MustBuild()
			sch := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
			mdl := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).Name("Original Name").MustBuild()

			// Setup database
			db := memory.New()
			err := db.Project.Save(ctx, proj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, sch)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, mdl)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceModel,
						ID:   mid.String(),
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
			modelUC := NewModel(db, gateways)

			// Execute
			got, err := modelUC.Update(ctx, param, operator)

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

func TestModel_Delete_WithCerbos(t *testing.T) {
	t.Parallel()

	// Setup read-only test identifiers
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := user.NewID()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:                   lo.ToPtr(uid),
			ReadableWorkspaces:     []accountdomain.WorkspaceID{wid},
			WritableWorkspaces:     []accountdomain.WorkspaceID{wid},
			MaintainableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects:     []id.ProjectID{pid},
		MaintainableProjects: []id.ProjectID{pid},
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
			proj := project.New().ID(pid).Workspace(wid).MustBuild()
			sch := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
			mdl := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()
			sp := *schema.NewPackage(sch, nil, nil, nil)

			// Setup database
			db := memory.New()
			err := db.Project.Save(ctx, proj)
			assert.NoError(t, err)
			err = db.Schema.Save(ctx, sch)
			assert.NoError(t, err)
			err = db.Model.Save(ctx, mdl)
			assert.NoError(t, err)

			// Setup mock authorization gateway
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			if tt.expectCerbos {
				expectedInput := gateway.AuthorizationInput{
					UserID:      uid,
					WorkspaceID: wid,
					Resource: gateway.ResourceInput{
						Type: rbac.ResourceModel,
						ID:   mid.String(),
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
			modelUC := NewModel(db, gateways)

			// Execute
			err = modelUC.Delete(ctx, mid, sp, operator)

			// Assert
			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)

			// Verify model was deleted
			_, err = db.Model.FindByID(ctx, mid)
			assert.Error(t, err) // Should not find the deleted model
		})
	}
}

func TestAuthorizer_NilSafe(t *testing.T) {
	t.Parallel()

	// Setup test data
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	uid := user.NewID()

	proj := project.New().ID(pid).Workspace(wid).MustBuild()
	sch := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
	mdl := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()

	operator := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               lo.ToPtr(uid),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		WritableProjects:     []id.ProjectID{pid},
		MaintainableProjects: []id.ProjectID{pid},
	}

	ctx := context.Background()
	db := memory.New()
	err := db.Project.Save(ctx, proj)
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, sch)
	assert.NoError(t, err)
	err = db.Model.Save(ctx, mdl)
	assert.NoError(t, err)

	// Create interactor WITHOUT authorization (nil gateway)
	modelUC := NewModel(db, nil)

	t.Run("FindByID works without authorization", func(t *testing.T) {
		got, err := modelUC.FindByID(ctx, mid, operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, mdl, got)
	})

	t.Run("Create works without authorization", func(t *testing.T) {
		param := interfaces.CreateModelParam{
			ProjectId:   pid,
			Name:        lo.ToPtr("Test Model"),
			Description: lo.ToPtr("Test Description"),
			Key:         lo.ToPtr("test-model-nil"),
		}

		got, err := modelUC.Create(ctx, param, operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, *param.Name, got.Name())
	})

	t.Run("Update works without authorization", func(t *testing.T) {
		newName := "Updated Name"
		param := interfaces.UpdateModelParam{
			ModelID: mid,
			Name:    &newName,
		}

		got, err := modelUC.Update(ctx, param, operator)
		assert.NoError(t, err)
		assert.NotNil(t, got)
		assert.Equal(t, newName, got.Name())
	})

	t.Run("Delete works without authorization", func(t *testing.T) {
		// Create a new model to delete
		newModel := model.New().NewID().Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()
		err = db.Model.Save(ctx, newModel)
		assert.NoError(t, err)

		sp := *schema.NewPackage(sch, nil, nil, nil)
		err = modelUC.Delete(ctx, newModel.ID(), sp, operator)
		assert.NoError(t, err)

		// Verify deleted
		_, err = db.Model.FindByID(ctx, newModel.ID())
		assert.Error(t, err)
	})
}
