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
	sid := id.NewSchemaID()
	id1 := id.NewModelID()
	m1 := model.New().ID(id1).Key(id.RandomKey()).Schema(sid).Project(id.NewProjectID()).MustBuild()
	id2 := id.NewModelID()
	m2 := model.New().ID(id2).Key(id.RandomKey()).Schema(sid).Project(id.NewProjectID()).MustBuild()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
	}

	tests := []struct {
		name  string
		seeds model.List
		args  struct {
			id       id.ModelID
			operator *usecase.Operator
		}
		want         *model.Model
		mockModelErr bool
		wantErr      error
	}{
		{
			name:  "find 1 of 2",
			seeds: model.List{m1, m2},
			args: struct {
				id       id.ModelID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    m1,
			wantErr: nil,
		},
		{
			name:  "find 1 of 0",
			seeds: model.List{},
			args: struct {
				id       id.ModelID
				operator *usecase.Operator
			}{
				id:       id1,
				operator: op,
			},
			want:    nil,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			if tc.mockModelErr {
				memory.SetModelError(db.Model, tc.wantErr)
			}
			for _, p := range tc.seeds {
				err := db.Model.Save(ctx, p)
				assert.NoError(t, err)
			}
			modelUC := NewModel(db, nil)

			got, err := modelUC.FindByID(ctx, tc.args.id, tc.args.operator)
			if tc.wantErr != nil {
				assert.Equal(t, tc.wantErr, err)
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
	type args struct {
		ids      []id.ModelID
		operator *usecase.Operator
	}
	type seeds struct {
		model   model.List
		project project.List
	}
	tests := []struct {
		name    string
		seeds   seeds
		args    args
		want    model.List
		mockErr bool
		wantErr error
	}{
		{},
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
			got, err := u.FindByIDs(ctx, tt.args.ids, tt.args.operator)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestModel_Update(t *testing.T) {
	type args struct {
		param    interfaces.UpdateModelParam
		operator *usecase.Operator
	}
	type seeds struct {
		model   model.List
		project project.List
	}
	tests := []struct {
		name    string
		seeds   seeds
		args    args
		want    *model.Model
		mockErr bool
		wantErr error
	}{
		{},
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

			got, err := u.Update(ctx, tt.args.param, tt.args.operator)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.Equal(t, tt.want, got)
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
	mockCtrl := gomock.NewController(t)
	defer mockCtrl.Finish()

	mRunner := gatewaymock.NewMockTaskRunner(mockCtrl)
	gw := &gateway.Container{TaskRunner: mRunner}
	u := NewModel(db, gw)

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
		setupMock func()
		wantErr   bool
		validate  func(t *testing.T, got *model.Model)
	}{
		{
			name: "successful copy",
			param: interfaces.CopyModelParam{
				ModelId: m.ID(),
				Name:    lo.ToPtr("Copied Model"),
			},
			setupMock: func() {
				mRunner.EXPECT().Run(ctx, gomock.Any()).Times(1).Return(nil)
			},
			wantErr: false,
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
			setupMock: func() {
				mRunner.EXPECT().Run(ctx, gomock.Any()).Times(0)
			},
			wantErr: true,
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
			setupMock: func() {
				mRunner.EXPECT().Run(ctx, gomock.Any()).Times(1).Return(errors.New("task runner error"))
			},
			wantErr: true,
			validate: func(t *testing.T, got *model.Model) {
				assert.Nil(t, got)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()
			got, err := u.Copy(ctx, tt.param, op)
			if tt.wantErr {
				assert.Error(t, err)
				tt.validate(t, nil)
			} else {
				assert.NoError(t, err)
				tt.validate(t, got)
			}
		})
	}
}
