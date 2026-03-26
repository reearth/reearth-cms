package interactor

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/user"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestModel_FindByID(t *testing.T) {
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}
	opNoUser := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	// each case gets its own model instances to avoid shared-pointer mutation races
	newM := func() *model.Model {
		return model.New().NewID().Key(id.RandomKey()).Schema(id.NewSchemaID()).Project(id.NewProjectID()).MustBuild()
	}

	mFind1, mFind2 := newM(), newM()
	mAllowed1, mAllowed2 := newM(), newM()
	mDenied1 := newM()
	mError1 := newM()
	mNoUser1, mNoUser2 := newM(), newM()

	tests := []struct {
		name      string
		seeds     model.List
		id        id.ModelID
		operator  *usecase.Operator
		want      *model.Model
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "find 1 of 2 without auth gateway",
			seeds:    model.List{mFind1, mFind2},
			id:       mFind1.ID(),
			operator: op,
			want:     mFind1,
		},
		{
			name:     "find 1 of 0 without auth gateway",
			seeds:    model.List{},
			id:       id.NewModelID(),
			operator: op,
			wantErr:  rerror.ErrNotFound,
		},
		{
			name:     "permission allowed",
			seeds:    model.List{mAllowed1, mAllowed2},
			id:       mAllowed1.ID(),
			operator: op,
			want:     mAllowed1,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			seeds:    model.List{mDenied1},
			id:       mDenied1.ID(),
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			seeds:    model.List{mError1},
			id:       mError1.ID(),
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
		{
			name:     "no user in operator - permission check still runs",
			seeds:    model.List{mNoUser1, mNoUser2},
			id:       mNoUser1.ID(),
			operator: opNoUser,
			want:     mNoUser1,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, m := range tc.seeds {
				assert.NoError(t, db.Model.Save(ctx, m))
				p := project.New().ID(m.Project()).Workspace(accountdomain.NewWorkspaceID()).MustBuild()
				assert.NoError(t, db.Project.Save(ctx, p))
			}

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			modelUC := NewModel(db, gateways)
			got, err := modelUC.FindByID(ctx, tc.id, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestModel_FindBySchema(t *testing.T) {
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}
	opNoUser := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	// each case gets its own schema ID + model instance to avoid shared-pointer mutation races
	newMWithSchema := func() (id.SchemaID, *model.Model) {
		sid := id.NewSchemaID()
		return sid, model.New().NewID().Key(id.RandomKey()).Schema(sid).Project(id.NewProjectID()).MustBuild()
	}

	sidFind, mFind := newMWithSchema()
	sidAllowed, mAllowed := newMWithSchema()
	sidNoUser, mNoUser := newMWithSchema()
	sidDenied, mDenied := newMWithSchema()
	sidError, mError := newMWithSchema()
	sidNotFound := id.NewSchemaID()

	tests := []struct {
		name      string
		seeds     model.List
		id        id.SchemaID
		operator  *usecase.Operator
		want      *model.Model
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "find by schema without auth gateway",
			seeds:    model.List{mFind},
			id:       sidFind,
			operator: op,
			want:     mFind,
		},
		{
			name:     "not found without auth gateway",
			seeds:    model.List{},
			id:       sidNotFound,
			operator: op,
			wantErr:  rerror.ErrNotFound,
		},
		{
			name:     "permission allowed",
			seeds:    model.List{mAllowed},
			id:       sidAllowed,
			operator: op,
			want:     mAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			seeds:    model.List{mDenied},
			id:       sidDenied,
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			seeds:    model.List{mError},
			id:       sidError,
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
		{
			name:     "no user in operator - permission check still runs",
			seeds:    model.List{mNoUser},
			id:       sidNoUser,
			operator: opNoUser,
			want:     mNoUser,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, m := range tc.seeds {
				assert.NoError(t, db.Model.Save(ctx, m))
				p := project.New().ID(m.Project()).Workspace(accountdomain.NewWorkspaceID()).MustBuild()
				assert.NoError(t, db.Project.Save(ctx, p))
			}

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			modelUC := NewModel(db, gateways)
			got, err := modelUC.FindBySchema(ctx, tc.id, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestModel_CheckKey(t *testing.T) {
	pId := id.NewProjectID()
	type args struct {
		pId id.ProjectID
		s   string
	}
	type seeds struct {
		model   model.List
		project project.List
	}
	tests := []struct {
		name    string
		seeds   seeds
		args    args
		want    bool
		mockErr bool
		wantErr error
	}{
		{
			name:  "in empty db",
			seeds: seeds{},
			args: args{
				pId: id.NewProjectID(),
				s:   "test123",
			},
			want:    true,
			mockErr: false,
			wantErr: nil,
		},
		{
			name: "with different key",
			seeds: seeds{
				model: []*model.Model{
					model.New().NewID().Key(id.RandomKey()).Project(pId).Schema(id.NewSchemaID()).MustBuild(),
				},
			},
			args: args{
				pId: pId,
				s:   "test123",
			},
			want:    true,
			mockErr: false,
			wantErr: nil,
		},
		{
			name: "with same key",
			seeds: seeds{
				model: []*model.Model{
					model.New().NewID().Key(id.NewKey("test123")).Project(pId).Schema(id.NewSchemaID()).MustBuild(),
				},
			},
			args: args{
				pId: pId,
				s:   "test123",
			},
			want:    false,
			mockErr: false,
			wantErr: nil,
		},
		{
			name: "with same key different project",
			seeds: seeds{
				model: []*model.Model{
					model.New().NewID().Key(id.NewKey("test123")).Project(pId).Schema(id.NewSchemaID()).MustBuild(),
				},
			},
			args: args{
				pId: id.NewProjectID(),
				s:   "test123",
			},
			want:    true,
			mockErr: false,
			wantErr: nil,
		},
		{
			name:  "with invalid key",
			seeds: seeds{},
			args: args{
				pId: id.NewProjectID(),
				s:   "12",
			},
			want:    false,
			mockErr: true,
			wantErr: model.ErrInvalidKey,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tt.mockErr {
				memory.SetModelError(db.Model, tt.wantErr)
			}
			for _, m := range tt.seeds.model {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tt.seeds.project {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			u := NewModel(db, nil)

			got, err := u.CheckKey(ctx, tt.args.pId, tt.args.s)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.False(t, got)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestModel_Create(t *testing.T) {
	// mId := id.NewModelID()
	// sId := id.NewSchemaID()
	wid1 := accountdomain.NewWorkspaceID()
	// wid2 := accountdomain.NewWorkspaceID()
	//
	pid1 := id.NewProjectID()
	p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(time.Now().Add(-time.Hour)).MustBuild()
	//
	// pid2 := id.NewProjectID()
	// p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mockTime).MustBuild()
	//
	u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{pid1},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(u.ID()),
		},
	}
	// op := &usecase.Operator{
	// 	User:               u.ID(),
	// 	ReadableWorkspaces: []id.WorkspaceID{wid1, wid2},
	// 	WritableWorkspaces: []id.WorkspaceID{wid1},
	// }

	type args struct {
		param    interfaces.CreateModelParam
		operator *usecase.Operator
	}

	type seeds struct {
		model   model.List
		project project.List
	}

	tests := []struct {
		name            string
		seeds           seeds
		args            args
		setupAuth       func(*gatewaymock.MockAuthorization)
		setupPolicyMock func(*gatewaymock.MockPolicyChecker)
		want            *model.Model
		mockErr         bool
		wantErr         error
	}{
		// TODO: fix
		// {
		// 	name: "add",
		// 	seeds: seeds{
		// 		model:   nil,
		// 		project: []*project.Project{p1, p2},
		// 	},
		// 	args: args{
		// 		param: interfaces.CreateModelParam{
		// 			ProjectId:   pid1,
		// 			Name:        lo.ToPtr("m1"),
		// 			Description: lo.ToPtr("m1"),
		// 			Key:         lo.ToPtr("k123456"),
		// 			Public:      lo.ToPtr(true),
		// 		},
		// 		operator: op,
		// 	},
		// 	want:    model.New().ID(mId).Schema(sId).Project(pid1).Name("m1").Description("m1").Key(key.New("k123456")).Public(true).UpdatedAt(mockTime).MustBuild(),
		// 	mockErr: false,
		// 	wantErr: nil,
		// },
		{
			name: "policy checker allows creation",
			seeds: seeds{
				model:   model.List{},
				project: project.List{p1},
			},
			args: args{
				param: interfaces.CreateModelParam{
					ProjectId:   pid1,
					Name:        lo.ToPtr("test-model"),
					Description: lo.ToPtr("test description"),
					Key:         lo.ToPtr("testkey"),
				},
				operator: op,
			},
			setupPolicyMock: func(mockPC *gatewaymock.MockPolicyChecker) {
				mockPC.EXPECT().CheckPolicy(gomock.Any(), gateway.PolicyCheckRequest{
					WorkspaceID: wid1,
					CheckType:   gateway.PolicyCheckModelCountPerProject,
					Value:       int64(0),
				}).Return(&gateway.PolicyCheckResponse{
					Allowed: true,
				}, nil)
			},
			wantErr: nil,
		},
		{
			name: "policy checker denies creation - limit exceeded",
			seeds: seeds{
				model:   model.List{},
				project: project.List{p1},
			},
			args: args{
				param: interfaces.CreateModelParam{
					ProjectId:   pid1,
					Name:        lo.ToPtr("test-model"),
					Description: lo.ToPtr("test description"),
					Key:         lo.ToPtr("testkey"),
				},
				operator: op,
			},
			setupPolicyMock: func(mockPC *gatewaymock.MockPolicyChecker) {
				mockPC.EXPECT().CheckPolicy(gomock.Any(), gateway.PolicyCheckRequest{
					WorkspaceID: wid1,
					CheckType:   gateway.PolicyCheckModelCountPerProject,
					Value:       int64(0),
				}).Return(&gateway.PolicyCheckResponse{
					Allowed: false,
				}, nil)
			},
			wantErr: interfaces.ErrModelCountPerProjectExceeded,
		},
		{
			name: "policy checker error",
			seeds: seeds{
				model:   model.List{},
				project: project.List{p1},
			},
			args: args{
				param: interfaces.CreateModelParam{
					ProjectId:   pid1,
					Name:        lo.ToPtr("test-model"),
					Description: lo.ToPtr("test description"),
					Key:         lo.ToPtr("testkey"),
				},
				operator: op,
			},
			setupPolicyMock: func(mockPC *gatewaymock.MockPolicyChecker) {
				mockPC.EXPECT().CheckPolicy(gomock.Any(), gateway.PolicyCheckRequest{
					WorkspaceID: wid1,
					CheckType:   gateway.PolicyCheckModelCountPerProject,
					Value:       int64(0),
				}).Return(nil, errors.New("policy check service error"))
			},
			wantErr: errors.New("policy check service error"),
		},
		{
			name: "permission denied - returns error",
			seeds: seeds{
				model:   model.List{},
				project: project.List{p1},
			},
			args: args{
				param: interfaces.CreateModelParam{
					ProjectId:   pid1,
					Name:        lo.ToPtr("test-model"),
					Description: lo.ToPtr("test description"),
					Key:         lo.ToPtr("testkey"),
				},
				operator: op,
			},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionCreate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
		},
		{
			name: "permission check error - returns error",
			seeds: seeds{
				model:   model.List{},
				project: project.List{p1},
			},
			args: args{
				param: interfaces.CreateModelParam{
					ProjectId:   pid1,
					Name:        lo.ToPtr("test-model"),
					Description: lo.ToPtr("test description"),
					Key:         lo.ToPtr("testkey"),
				},
				operator: op,
			},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionCreate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			mockCtrl := gomock.NewController(t)
			defer mockCtrl.Finish()

			mockPolicyChecker := gatewaymock.NewMockPolicyChecker(mockCtrl)
			gw := &gateway.Container{PolicyChecker: mockPolicyChecker}

			if tt.setupAuth != nil {
				mockAuth := gatewaymock.NewMockAuthorization(mockCtrl)
				tt.setupAuth(mockAuth)
				gw.Authorization = mockAuth
			}

			if tt.setupPolicyMock != nil {
				tt.setupPolicyMock(mockPolicyChecker)
			}

			if tt.mockErr {
				memory.SetModelError(db.Model, tt.wantErr)
			}
			for _, m := range tt.seeds.model {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tt.seeds.project {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}

			u := NewModel(db, gw)

			got, err := u.Create(ctx, tt.args.param, tt.args.operator)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			if tt.want != nil {
				assert.Equal(t, tt.want, got)
			} else {
				assert.NotNil(t, got)
			}
		})
	}
}

func TestModel_Delete(t *testing.T) {
	t.Parallel()

	wid := accountdomain.NewWorkspaceID()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newModel := func(pid id.ProjectID, sid id.SchemaID) *model.Model {
		return model.New().NewID().Key(id.RandomKey()).Project(pid).Schema(sid).MustBuild()
	}
	newSchema := func(pid id.ProjectID) *schema.Schema {
		return schema.New().NewID().Workspace(wid).Project(pid).MustBuild()
	}

	t.Run("not found", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()
		u := NewModel(db, nil)

		sp := *schema.NewPackage(nil, nil, nil, nil)
		err := u.Delete(ctx, id.NewModelID(), sp, op)
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})

	t.Run("operation denied", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()
		s := newSchema(p.ID())
		m := newModel(p.ID(), s.ID())

		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m.Clone()))
		assert.NoError(t, db.Schema.Save(ctx, s.Clone()))

		// operator does not own this project
		restrictedOp := &usecase.Operator{
			OwningProjects: []id.ProjectID{},
			AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
		}
		sp := *schema.NewPackage(s, nil, nil, nil)
		u := NewModel(db, nil)
		err := u.Delete(ctx, m.ID(), sp, restrictedOp)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("deletes model with views and items", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()
		s := newSchema(p.ID())
		m := newModel(p.ID(), s.ID())

		ownerOp := &usecase.Operator{
			OwningProjects: []id.ProjectID{p.ID()},
			AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
		}

		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m.Clone()))
		assert.NoError(t, db.Schema.Save(ctx, s.Clone()))

		// seed a view for the model
		v := view.New().NewID().Model(m.ID()).Project(p.ID()).MustBuild()
		assert.NoError(t, db.View.Save(ctx, v))

		// seed an item for the model
		it := item.New().NewID().Schema(s.ID()).Model(m.ID()).Project(p.ID()).Thread(id.NewThreadID().Ref()).MustBuild()
		assert.NoError(t, db.Item.Save(ctx, it))

		sp := *schema.NewPackage(s, nil, nil, nil)
		u := NewModel(db, nil)
		err := u.Delete(ctx, m.ID(), sp, ownerOp)
		assert.NoError(t, err)

		// model should be gone
		_, err = db.Model.FindByID(ctx, m.ID())
		assert.ErrorIs(t, err, rerror.ErrNotFound)

		// view should be gone
		views, _ := db.View.FindByModel(ctx, m.ID())
		assert.Empty(t, views)

		// item should be gone
		_, err = db.Item.FindByID(ctx, it.ID(), nil)
		assert.ErrorIs(t, err, rerror.ErrNotFound)

		// schema should be gone
		_, err = db.Schema.FindByID(ctx, s.ID())
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})

	t.Run("permission denied - returns error", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()
		s := newSchema(p.ID())
		m := newModel(p.ID(), s.ID())
		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m.Clone()))
		assert.NoError(t, db.Schema.Save(ctx, s.Clone()))

		ctrl := gomock.NewController(t)
		mockAuth := gatewaymock.NewMockAuthorization(ctrl)
		mockAuth.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionDelete, gomock.Any()).Return(false, nil)

		sp := *schema.NewPackage(s, nil, nil, nil)
		u := NewModel(db, &gateway.Container{Authorization: mockAuth})
		err := u.Delete(ctx, m.ID(), sp, op)
		assert.ErrorIs(t, err, interfaces.ErrOperationDenied)
	})

	t.Run("permission check error - returns error", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()
		s := newSchema(p.ID())
		m := newModel(p.ID(), s.ID())
		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m.Clone()))
		assert.NoError(t, db.Schema.Save(ctx, s.Clone()))

		ctrl := gomock.NewController(t)
		mockAuth := gatewaymock.NewMockAuthorization(ctrl)
		mockAuth.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionDelete, gomock.Any()).Return(false, errors.New("cerbos unavailable"))

		sp := *schema.NewPackage(s, nil, nil, nil)
		u := NewModel(db, &gateway.Container{Authorization: mockAuth})
		err := u.Delete(ctx, m.ID(), sp, op)
		assert.EqualError(t, err, "cerbos unavailable")
	})

	t.Run("deletes metadata schema when present", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()
		s := newSchema(p.ID())
		meta := newSchema(p.ID())
		m := model.New().NewID().Key(id.RandomKey()).Project(p.ID()).Schema(s.ID()).Metadata(meta.ID().Ref()).MustBuild()

		ownerOp := &usecase.Operator{
			OwningProjects: []id.ProjectID{p.ID()},
			AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
		}

		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m))
		assert.NoError(t, db.Schema.Save(ctx, s.Clone()))
		assert.NoError(t, db.Schema.Save(ctx, meta.Clone()))

		sp := *schema.NewPackage(s, meta, nil, nil)
		u := NewModel(db, nil)
		err := u.Delete(ctx, m.ID(), sp, ownerOp)
		assert.NoError(t, err)

		_, err = db.Schema.FindByID(ctx, s.ID())
		assert.ErrorIs(t, err, rerror.ErrNotFound)
		_, err = db.Schema.FindByID(ctx, meta.ID())
		assert.ErrorIs(t, err, rerror.ErrNotFound)
	})

	t.Run("removes dangling reference field from sibling schema on delete (two-way)", func(t *testing.T) {
		t.Parallel()
		ctx := context.Background()
		db := memory.New()

		p := project.New().NewID().Workspace(wid).MustBuild()

		// model1 (to be deleted)
		s1 := newSchema(p.ID())
		m1 := newModel(p.ID(), s1.ID())

		// model2 (sibling)
		s2 := newSchema(p.ID())
		m2 := newModel(p.ID(), s2.ID())

		// Two-way reference:
		f1ID := id.NewFieldID()
		f2ID := id.NewFieldID()

		f1, err := schema.NewField(schema.NewReference(m2.ID(), s2.ID(), lo.ToPtr(f2ID), nil).TypeProperty()).
			ID(f1ID).
			Key(id.RandomKey()).
			Build()
		assert.NoError(t, err)
		s1.AddField(f1)

		f2, err := schema.NewField(schema.NewReference(m1.ID(), s1.ID(), lo.ToPtr(f1ID), nil).TypeProperty()).
			ID(f2ID).
			Key(id.RandomKey()).
			Build()
		assert.NoError(t, err)
		s2.AddField(f2)

		ownerOp := &usecase.Operator{
			OwningProjects: []id.ProjectID{p.ID()},
			AcOperator:     &accountusecase.Operator{User: accountdomain.NewUserID().Ref()},
		}

		assert.NoError(t, db.Project.Save(ctx, p.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m1))
		assert.NoError(t, db.Schema.Save(ctx, s1.Clone()))
		assert.NoError(t, db.Model.Save(ctx, m2))
		assert.NoError(t, db.Schema.Save(ctx, s2.Clone()))

		sp := *schema.NewPackage(s1, nil, nil, nil)
		u := NewModel(db, nil)
		assert.NoError(t, u.Delete(ctx, m1.ID(), sp, ownerOp))

		// s2 should still exist
		s2After, err := db.Schema.FindByID(ctx, s2.ID())
		assert.NoError(t, err)

		// f2 (back-reference pointing at s1) must be gone; s2 has no reference fields left
		assert.Empty(t, s2After.FieldsByType(value.TypeReference), "dangling back-reference field should have been removed from sibling schema")
	})
}

func TestModel_FindByIDs(t *testing.T) {
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}
	opNoUser := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	// each case gets its own model instances to avoid shared-pointer mutation races
	newM := func() *model.Model {
		return model.New().NewID().Key(id.RandomKey()).Schema(id.NewSchemaID()).Project(id.NewProjectID()).MustBuild()
	}

	mFind1, mFind2 := newM(), newM()
	mAllowed1, mAllowed2 := newM(), newM()
	mNoUser1, mNoUser2 := newM(), newM()

	tests := []struct {
		name      string
		seeds     model.List
		ids       []id.ModelID
		operator  *usecase.Operator
		want      model.List
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "find by ids without auth gateway",
			seeds:    model.List{mFind1, mFind2},
			ids:      []id.ModelID{mFind1.ID(), mFind2.ID()},
			operator: op,
			want:     model.List{mFind1, mFind2},
		},
		{
			name:     "permission allowed",
			seeds:    model.List{mAllowed1, mAllowed2},
			ids:      []id.ModelID{mAllowed1.ID(), mAllowed2.ID()},
			operator: op,
			want:     model.List{mAllowed1, mAllowed2},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			seeds:    model.List{},
			ids:      []id.ModelID{id.NewModelID()},
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionList, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			seeds:    model.List{},
			ids:      []id.ModelID{id.NewModelID()},
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionList, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
		{
			name:     "no user in operator - permission check still runs",
			seeds:    model.List{mNoUser1, mNoUser2},
			ids:      []id.ModelID{mNoUser1.ID(), mNoUser2.ID()},
			operator: opNoUser,
			want:     model.List{mNoUser1, mNoUser2},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, m := range tc.seeds {
				assert.NoError(t, db.Model.Save(ctx, m))
				p := project.New().ID(m.Project()).Workspace(accountdomain.NewWorkspaceID()).MustBuild()
				assert.NoError(t, db.Project.Save(ctx, p))
			}

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			modelUC := NewModel(db, gateways)
			got, err := modelUC.FindByIDs(ctx, tc.ids, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestModel_Update(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	p := project.New().ID(pid).Workspace(wid).MustBuild()
	m1 := model.New().NewID().Key(id.RandomKey()).Schema(id.NewSchemaID()).Project(pid).MustBuild()

	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{pid},
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}
	opNoUser := &usecase.Operator{
		AcOperator: &accountusecase.Operator{},
	}

	tests := []struct {
		name      string
		param     interfaces.UpdateModelParam
		operator  *usecase.Operator
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "update without auth gateway",
			param:    interfaces.UpdateModelParam{ModelID: m1.ID(), Name: lo.ToPtr("updated")},
			operator: op,
		},
		{
			name:     "permission allowed",
			param:    interfaces.UpdateModelParam{ModelID: m1.ID(), Name: lo.ToPtr("updated")},
			operator: op,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			param:    interfaces.UpdateModelParam{ModelID: m1.ID(), Name: lo.ToPtr("updated")},
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			param:    interfaces.UpdateModelParam{ModelID: m1.ID(), Name: lo.ToPtr("updated")},
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
		{
			name:    "no user in operator - permission check still runs",
			param:   interfaces.UpdateModelParam{ModelID: m1.ID(), Name: lo.ToPtr("updated")},
			operator: opNoUser,
			wantErr:  interfaces.ErrOperationDenied, // from IsWritableProject check
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Project.Save(ctx, p.Clone()))
			assert.NoError(t, db.Model.Save(ctx, m1.Clone()))

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			modelUC := NewModel(db, gateways)
			got, err := modelUC.Update(ctx, tc.param, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, got)
		})
	}
}

func TestNewModel(t *testing.T) {
	type args struct {
		r *repo.Container
	}
	tests := []struct {
		name string
		args args
		want interfaces.Model
	}{
		// {},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, NewModel(tt.args.r, nil))
		})
	}
}

func TestModel_Copy(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	fId1 := id.NewFieldID()
	sfKey1 := id.RandomKey()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId1).Key(sfKey1).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{sf1}).MustBuild()
	fId2 := id.NewFieldID()
	sfKey2 := id.RandomKey()
	sf2 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId2).Key(sfKey2).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{sf2}).MustBuild()
	m := model.New().NewID().Key(id.RandomKey()).Project(p.ID()).Schema(s1.ID()).Metadata(s2.ID().Ref()).MustBuild()

	ctx := context.Background()
	db := memory.New()

	err := db.Project.Save(ctx, p.Clone())
	assert.NoError(t, err)
	err = db.Model.Save(ctx, m.Clone())
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s1.Clone())
	assert.NoError(t, err)
	err = db.Schema.Save(ctx, s2.Clone())
	assert.NoError(t, err)

	tests := []struct {
		name      string
		param     interfaces.CopyModelParam
		setupMock func(mock *gatewaymock.MockTaskRunner)
		setupAuth func(*gatewaymock.MockAuthorization)
		wantErr   error
		validate  func(t *testing.T, got *model.Model)
	}{
		{
			name: "successful copy",
			param: interfaces.CopyModelParam{
				ModelId: m.ID(),
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func(mock *gatewaymock.MockTaskRunner) {
				mock.EXPECT().Run(ctx, gomock.Any()).Times(1).Return(nil)
			},
			validate: func(t *testing.T, got *model.Model) {
				assert.NotEqual(t, m.ID(), got.ID())
				assert.NotEqual(t, m.Key(), got.Key())
				assert.Equal(t, "Copied Model", got.Name())
				assert.Equal(t, m.Description(), got.Description())
			},
		},
		{
			name: "missing model ID",
			param: interfaces.CopyModelParam{
				ModelId: id.ModelID{},
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func(mock *gatewaymock.MockTaskRunner) {},
			wantErr:   rerror.ErrNotFound,
			validate: func(t *testing.T, got *model.Model) {
				assert.Nil(t, got)
			},
		},
		{
			name: "task runner error",
			param: interfaces.CopyModelParam{
				ModelId: m.ID(),
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func(mock *gatewaymock.MockTaskRunner) {
				mock.EXPECT().Run(ctx, gomock.Any()).Times(1).Return(errors.New("task runner error"))
			},
			wantErr: errors.New("failed to trigger copy event: task runner error"),
			validate: func(t *testing.T, got *model.Model) {
				assert.Nil(t, got)
			},
		},
		{
			name: "permission denied - returns error",
			param: interfaces.CopyModelParam{
				ModelId: m.ID(),
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func(mock *gatewaymock.MockTaskRunner) {},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionCreate, gomock.Any()).Return(false, nil)
			},
			wantErr: interfaces.ErrOperationDenied,
			validate: func(t *testing.T, got *model.Model) {
				assert.Nil(t, got)
			},
		},
		{
			name: "permission check error - returns error",
			param: interfaces.CopyModelParam{
				ModelId: m.ID(),
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func(mock *gatewaymock.MockTaskRunner) {},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceModel, rbac.ActionCreate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
			wantErr: errors.New("cerbos unavailable"),
			validate: func(t *testing.T, got *model.Model) {
				assert.Nil(t, got)
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctrl := gomock.NewController(t)
			mRunner := gatewaymock.NewMockTaskRunner(ctrl)
			tt.setupMock(mRunner)

			gw := &gateway.Container{TaskRunner: mRunner}
			if tt.setupAuth != nil {
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tt.setupAuth(mockAuth)
				gw.Authorization = mockAuth
			}

			modelUC := NewModel(db, gw)
			got, err := modelUC.Copy(ctx, tt.param, op)
			if tt.wantErr != nil {
				assert.EqualError(t, err, tt.wantErr.Error())
				tt.validate(t, nil)
			} else {
				assert.NoError(t, err)
				tt.validate(t, got)
			}
		})
	}
}
