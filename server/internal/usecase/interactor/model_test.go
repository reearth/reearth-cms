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
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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
	mockTime := time.Now()
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
			defer memory.MockNow(db, mockTime)()
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
	mockTime := time.Now()
	// mId := id.NewModelID()
	// sId := id.NewSchemaID()
	// wid1 := accountdomain.NewWorkspaceID()
	// wid2 := accountdomain.NewWorkspaceID()
	//
	// pid1 := id.NewProjectID()
	// p1 := project.New().ID(pid1).Workspace(wid1).UpdatedAt(mockTime).MustBuild()
	//
	// pid2 := id.NewProjectID()
	// p2 := project.New().ID(pid2).Workspace(wid2).UpdatedAt(mockTime).MustBuild()
	//
	// u := user.New().NewID().Email("aaa@bbb.com").Workspace(wid1).MustBuild()
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
		name    string
		seeds   seeds
		args    args
		want    *model.Model
		mockErr bool
		wantErr error
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
			defer memory.MockNow(db, mockTime)()
			for _, m := range tt.seeds.model {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tt.seeds.project {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			u := NewModel(db, nil)

			got, err := u.Create(ctx, tt.args.param, tt.args.operator)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestModel_Delete(t *testing.T) {
	mockTime := time.Now()
	type args struct {
		modelID  id.ModelID
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
		mockErr bool
		wantErr error
	}{
		// {},
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
			defer memory.MockNow(db, mockTime)()
			for _, m := range tt.seeds.model {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tt.seeds.project {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			u := NewModel(db, nil)

			assert.Equal(t, tt.wantErr, u.Delete(ctx, tt.args.modelID, tt.args.operator))
		})
	}
}

func TestModel_FindByIDs(t *testing.T) {
	mockTime := time.Now()
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
			defer memory.MockNow(db, mockTime)()
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

func TestModel_Publish(t *testing.T) {
	mockTime := time.Now()
	pId := id.NewProjectID()
	sid := id.NewSchemaID()
	mId1 := id.NewModelID()
	m1 := model.New().ID(mId1).Key(id.RandomKey()).Schema(sid).Project(pId).MustBuild()
	mId2 := id.NewModelID()
	m2 := model.New().ID(mId2).Key(id.RandomKey()).Schema(sid).Project(pId).MustBuild()

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: lo.ToPtr(user.NewID()),
		},
		OwningProjects: id.ProjectIDList{pId},
	}

	type args struct {
		params   []interfaces.PublishModelParam
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
		mockErr bool
		wantErr error
	}{
		{
			name:  "empty params",
			seeds: seeds{},
			args: args{
				params:   nil,
				operator: nil,
			},
			mockErr: false,
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:  "empty params",
			seeds: seeds{},
			args: args{
				params:   []interfaces.PublishModelParam{},
				operator: nil,
			},
			mockErr: false,
			wantErr: rerror.ErrInvalidParams,
		},
		{
			name:  "not found model",
			seeds: seeds{},
			args: args{
				params: []interfaces.PublishModelParam{{
					ModelID: id.ModelID{},
					Public:  false,
				}},
				operator: nil,
			},
			mockErr: false,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "not found model",
			seeds: seeds{model.List{m1, m2}, project.List{}},
			args: args{
				params: []interfaces.PublishModelParam{{
					ModelID: id.NewModelID(),
					Public:  false,
				}},
				operator: nil,
			},
			mockErr: false,
			wantErr: rerror.ErrNotFound,
		},
		{
			name:  "not found model",
			seeds: seeds{model.List{m1, m2}, project.List{}},
			args: args{
				params: []interfaces.PublishModelParam{
					{
						ModelID: mId1,
						Public:  false,
					},
					{
						ModelID: mId2,
						Public:  true,
					},
				},
				operator: op,
			},
			mockErr: false,
			wantErr: nil,
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
			defer memory.MockNow(db, mockTime)()
			for _, m := range tt.seeds.model {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, p := range tt.seeds.project {
				err := db.Project.Save(ctx, p.Clone())
				assert.NoError(t, err)
			}
			u := NewModel(db, nil)

			err := u.Publish(ctx, tt.args.params, tt.args.operator)
			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
			} else {
				assert.NoError(t, err)
			}

		})
	}
}

func TestModel_Update(t *testing.T) {
	mockTime := time.Now()
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
			defer memory.MockNow(db, mockTime)()
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
	mockTime := time.Now()
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

	defer memory.MockNow(db, mockTime)()

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
				assert.Equal(t, m.Public(), got.Public())
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
