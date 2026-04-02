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
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestView_FindByIDs_CheckPermission(t *testing.T) {

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}

	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("test").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.View.Save(ctx, v))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			got, err := viewUC.FindByIDs(ctx, view.IDList{v.ID()}, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
		})
	}
}

func TestView_FindByModel_CheckPermission(t *testing.T) {

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}

	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("test").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionList, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionList, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			m := model.New().ID(mid).Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.Model.Save(ctx, m))
			assert.NoError(t, db.View.Save(ctx, v))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			got, err := viewUC.FindByModel(ctx, mid, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 1)
		})
	}
}

func TestView_Create_CheckPermission(t *testing.T) {

	pid := id.NewProjectID()
	wid := accountdomain.NewWorkspaceID()

	uid := user.NewID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(uid),
		},
	}
	opMaintainer := &usecase.Operator{
		MaintainableProjects: id.ProjectIDList{pid},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(uid),
		},
	}

	p := project.New().ID(pid).Workspace(wid).MustBuild()

	tests := []struct {
		name      string
		operator  *usecase.Operator
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name:     "permission allowed",
			operator: opMaintainer,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionCreate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied",
			operator: op,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionCreate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name:     "permission check error",
			operator: op,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionCreate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			sid := id.NewSchemaID()
			m := model.New().NewID().Key(id.RandomKey()).Schema(sid).Project(pid).MustBuild()

			param := interfaces.CreateViewParam{
				Project: pid,
				Model:   m.ID(),
				Name:    "test view",
			}

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.Model.Save(ctx, m))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			got, err := viewUC.Create(ctx, param, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
		})
	}
}

func TestView_FindByID_CheckPermission(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("test").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.View.Save(ctx, v))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			// FindByID is not on the View interface; exercise it via the concrete type.
			got, err := viewUC.(*View).FindByID(ctx, v.ID(), op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
		})
	}
}

func TestView_Update_CheckPermission(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	uid := user.NewID()
	opMaintainer := &usecase.Operator{
		MaintainableProjects: id.ProjectIDList{pid},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(uid),
		},
	}

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("test").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.View.Save(ctx, v))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			name := "updated"
			param := interfaces.UpdateViewParam{Name: &name}

			viewUC := NewView(db, gateways)
			got, err := viewUC.Update(ctx, v.ID(), param, opMaintainer)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
		})
	}
}

func TestView_UpdateOrder_CheckPermission(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	uid := user.NewID()
	opMaintainer := &usecase.Operator{
		MaintainableProjects: id.ProjectIDList{pid},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(uid),
		},
	}

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v1 := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("view1").MustBuild()
	v2 := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("view2").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.View.Save(ctx, v1))
			assert.NoError(t, db.View.Save(ctx, v2))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			got, err := viewUC.UpdateOrder(ctx, view.IDList{v1.ID(), v2.ID()}, opMaintainer)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.Len(t, got, 2)
		})
	}
}

func TestView_Delete_CheckPermission(t *testing.T) {
	pid := id.NewProjectID()
	mid := id.NewModelID()
	sid := id.NewSchemaID()
	wid := accountdomain.NewWorkspaceID()

	uid := user.NewID()
	opMaintainer := &usecase.Operator{
		MaintainableProjects: id.ProjectIDList{pid},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(uid),
		},
	}

	p := project.New().ID(pid).Workspace(wid).MustBuild()
	v1 := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("view1").MustBuild()
	v2 := view.New().NewID().Project(pid).Model(mid).Schema(sid).Name("view2").MustBuild()

	tests := []struct {
		name      string
		setupAuth func(mock *gatewaymock.MockAuthorization)
		wantErr   error
	}{
		{
			name: "permission allowed",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionDelete, gomock.Any()).Return(true, nil)
			},
		},
		{
			name: "permission denied",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionDelete, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error",
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceView, rbac.ActionDelete, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p))
			assert.NoError(t, db.View.Save(ctx, v1))
			assert.NoError(t, db.View.Save(ctx, v2))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			gateways := &gateway.Container{Authorization: mockAuth}

			viewUC := NewView(db, gateways)
			err := viewUC.Delete(ctx, v1.ID(), opMaintainer)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
		})
	}
}
