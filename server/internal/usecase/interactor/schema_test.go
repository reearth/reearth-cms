package interactor

import (
	"context"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestModel_UpdateWithNewSchemaFields(t *testing.T) {
	mockTime := time.Now()
	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	op1 := &usecase.Operator{
		ReadableProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	// Base fields and schemas
	fId1 := id.NewFieldID()
	sfKey1 := id.RandomKey()
	sf1 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId1).Key(sfKey1).MustBuild()
	s1 := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{sf1}).MustBuild()

	fId2 := id.NewFieldID()
	sfKey2 := id.RandomKey()
	sf2 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId2).Key(sfKey2).MustBuild()
	s2 := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{sf2}).MustBuild()

	mId1 := id.NewModelID()
	m1 := model.New().ID(mId1).Key(id.RandomKey()).Project(p.ID()).Schema(s1.ID()).Metadata(s1.ID().Ref()).MustBuild()

	type args struct {
		modelData          interfaces.ModelData
		createFieldsParams []interfaces.CreateFieldParam
		operator           *usecase.Operator
	}
	type seeds struct {
		model   model.List
		project project.List
		schema  schema.List
	}
	tests := []struct {
		name    string
		seeds   seeds
		args    args
		wantErr error
	}{
		{
			name: "successful update with schema fields",
			seeds: seeds{
				model:   model.List{m1},
				project: project.List{p},
				schema:  schema.List{s1, s2},
			},
			args: args{
				modelData: interfaces.ModelData{
					ModelID:   lo.ToPtr(mId1),
					SchemaID:  s1.ID(),
					ProjectID: p.ID(),
				},
				createFieldsParams: []interfaces.CreateFieldParam{
					{
						ModelID:      &mId1,
						Type:         value.TypeBool,
						Name:         "test",
						Description:  lo.ToPtr("test description"),
						Key:          "field1",
						Multiple:     false,
						Unique:       false,
						Required:     false,
						IsTitle:      false,
						DefaultValue: sf1.DefaultValue(),
						TypeProperty: sf1.TypeProperty(),
					},
				},
				operator: op,
			},
			wantErr: nil,
		},
		{
			name: "duplicate field key error",
			seeds: seeds{
				model:   model.List{m1},
				project: project.List{p},
				schema:  schema.List{s1, s2},
			},
			args: args{
				modelData: interfaces.ModelData{
					ModelID:   lo.ToPtr(mId1),
					SchemaID:  s1.ID(),
					ProjectID: p.ID(),
				},
				createFieldsParams: []interfaces.CreateFieldParam{
					{
						ModelID:      &mId1,
						Type:         value.TypeBool,
						Name:         "test1",
						Key:          "123",
						TypeProperty: sf1.TypeProperty(),
					},
					{
						ModelID:      &mId1,
						Type:         value.TypeText,
						Name:         "test2",
						Key:          "123",
						TypeProperty: sf2.TypeProperty(),
					},
				},
				operator: op,
			},
			wantErr: schema.ErrInvalidKey,
		},
		{
			name: "schema not found",
			seeds: seeds{
				model:   model.List{m1},
				project: project.List{p},
				schema:  schema.List{},
			},
			args: args{
				modelData: interfaces.ModelData{
					ModelID:   lo.ToPtr(mId1),
					SchemaID:  s1.ID(),
					ProjectID: p.ID(),
				},
				createFieldsParams: []interfaces.CreateFieldParam{
					{
						ModelID:      &mId1,
						Type:         value.TypeBool,
						Name:         "test",
						Description:  lo.ToPtr("test description"),
						Key:          "field1",
						Multiple:     false,
						Unique:       false,
						Required:     false,
						IsTitle:      false,
						DefaultValue: sf1.DefaultValue(),
						TypeProperty: sf1.TypeProperty(),
					},
				},
				operator: op,
			},
			wantErr: rerror.ErrNotFound,
		},
		{
			name: "is not maintaining project error",
			seeds: seeds{
				model:   model.List{m1},
				project: project.List{p},
				schema:  schema.List{s1},
			},
			args: args{
				modelData: interfaces.ModelData{
					ModelID:   lo.ToPtr(mId1),
					SchemaID:  s1.ID(),
					ProjectID: p.ID(),
				},
				createFieldsParams: []interfaces.CreateFieldParam{
					{
						ModelID:      &mId1,
						Type:         value.TypeBool,
						Name:         "test",
						Description:  lo.ToPtr("test description"),
						Key:          "field1",
						Multiple:     false,
						Unique:       false,
						Required:     false,
						IsTitle:      false,
						DefaultValue: sf1.DefaultValue(),
						TypeProperty: sf1.TypeProperty(),
					},
				},
				operator: op1,
			},
			wantErr: interfaces.ErrOperationDenied,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			u := NewSchema(db, nil)
			defer memory.MockNow(db, mockTime)()
			for _, m := range tt.seeds.model {
				assert.NoError(t, db.Model.Save(ctx, m.Clone()))
			}
			for _, p := range tt.seeds.project {
				assert.NoError(t, db.Project.Save(ctx, p.Clone()))
			}

			for _, s := range tt.seeds.schema {
				assert.NoError(t, db.Schema.Save(ctx, s.Clone()))
			}

			got, err := u.CreateFieldsForModel(ctx, tt.args.modelData, tt.args.createFieldsParams, tt.args.operator)

			if tt.wantErr != nil {
				assert.Equal(t, tt.wantErr, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, got)
			}
		})
	}
}
