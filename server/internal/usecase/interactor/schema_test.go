package interactor

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestModel_UpdateWithNewSchemaFields(t *testing.T) {
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
		schemaId           id.SchemaID
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
				schemaId: s1.ID(),
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
				schemaId: s1.ID(),
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
			wantErr: id.ErrDuplicatedKey,
		},
		{
			name: "schema not found",
			seeds: seeds{
				model:   model.List{m1},
				project: project.List{p},
				schema:  schema.List{},
			},
			args: args{
				schemaId: s1.ID(),
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
				schemaId: s1.ID(),
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
			for _, m := range tt.seeds.model {
				assert.NoError(t, db.Model.Save(ctx, m.Clone()))
			}
			for _, p := range tt.seeds.project {
				assert.NoError(t, db.Project.Save(ctx, p.Clone()))
			}

			for _, s := range tt.seeds.schema {
				assert.NoError(t, db.Schema.Save(ctx, s.Clone()))
			}

			got, err := u.CreateFields(ctx, tt.args.schemaId, tt.args.createFieldsParams, tt.args.operator)

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

func TestAsset_GuessSchemaFields(t *testing.T) {
	uid := accountdomain.NewUserID()

	ws := workspace.New().NewID().MustBuild()
	proj1 := project.New().NewID().Workspace(ws.ID()).MustBuild()
	u1 := "5130c89f-8f67-4766-b127-49ee6796d464"
	aid1 := id.NewAssetID()
	a1 := asset.New().ID(aid1).Project(proj1.ID()).UUID(u1).
		CreatedByUser(uid).Size(1000).FileName("test.geojson").MustBuild()
	fileContent1 := []byte(`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "test",
        "height": 123.5,
        "age": 2,
        "is_active": true
      },
      "geometry": {
        "coordinates": [
          106.83394478570801,
          -6.170070705932318
        ],
        "type": "Point"
      }
    }
  ]
}`)

	af1 := asset.NewFile().
		Name("test.geojson").
		Path("test.geojson").
		ContentType("application/geo+json").
		Size(uint64(len(fileContent1))).
		Build()

	mid1 := id.NewModelID()
	sid1 := id.NewSchemaID()
	m1 := model.New().ID(mid1).Project(proj1.ID()).Schema(sid1).Key(id.RandomKey()).MustBuild()
	s1 := schema.New().ID(sid1).Project(proj1.ID()).Workspace(ws.ID()).MustBuild()

	aid2 := id.NewAssetID()
	u2 := "5030c89f-8f67-4766-b127-49ee6796d464"
	a2 := asset.New().ID(aid2).Project(proj1.ID()).UUID(u2).
		CreatedByUser(uid).Size(1000).MustBuild()
	fileContent2 := []byte(`[
    {
        "name": "John Doe",
        "age": 30,
        "is_active": true,
        "height": 5.9
    }
]`)
	af2 := asset.NewFile().
		Name("test.json").
		Path("test.json").
		ContentType("application/json").
		Size(uint64(len(fileContent2))).
		Build()

	acop := &accountusecase.Operator{
		User:             &uid,
		OwningWorkspaces: []accountdomain.WorkspaceID{ws.ID()},
	}
	op := &usecase.Operator{
		AcOperator:     acop,
		OwningProjects: []id.ProjectID{proj1.ID()},
	}

	type args struct {
		assetID id.AssetID
		modelID id.ModelID
		op      *usecase.Operator
	}
	type seeds struct {
		assets []*asset.Asset
		models []*model.Model
		schema []*schema.Schema
	}
	tests := []struct {
		name      string
		args      args
		seeds     seeds
		seedFiles map[asset.ID]*asset.File
		want      *interfaces.GuessSchemaFieldsData
		wantErr   error
	}{
		{
			name: "Success GeoJSON file",
			args: args{
				assetID: a1.ID(),
				modelID: mid1,
				op:      op,
			},
			seeds: seeds{
				assets: []*asset.Asset{
					a1,
				},
				models: []*model.Model{m1},
				schema: []*schema.Schema{s1},
			},
			seedFiles: map[asset.ID]*asset.File{
				a1.ID(): af1,
			},
			want: &interfaces.GuessSchemaFieldsData{
				Fields: []interfaces.GuessSchemaField{
					{
						Name: "geometry",
						Type: "geometryObject",
						Key:  "geometry",
					},
					{
						Name: "name",
						Type: "text",
						Key:  "name",
					},
					{
						Name: "height",
						Type: "number",
						Key:  "height",
					},
					{
						Name: "age",
						Type: "integer",
						Key:  "age",
					},
					{
						Name: "is_active",
						Type: "bool",
						Key:  "is_active",
					},
				},
				TotalCount: 5,
			},
		},
		{
			name: "Success JSON Schema file",
			args: args{
				assetID: a2.ID(),
				modelID: mid1,
				op:      op,
			},
			seeds: seeds{
				assets: []*asset.Asset{
					a2,
				},
				models: []*model.Model{m1},
				schema: []*schema.Schema{s1},
			},
			seedFiles: map[asset.ID]*asset.File{
				a2.ID(): af2,
			},
			want: &interfaces.GuessSchemaFieldsData{
				Fields: []interfaces.GuessSchemaField{
					{
						Name: "name",
						Type: "text",
						Key:  "name",
					},
					{
						Name: "age",
						Type: "integer",
						Key:  "age",
					},
					{
						Name: "is_active",
						Type: "bool",
						Key:  "is_active",
					},
					{
						Name: "height",
						Type: "number",
						Key:  "height",
					},
				},
				TotalCount: 4,
			},
			wantErr: nil,
		},
		{
			name: "invalid operator",
			args: args{
				assetID: a1.ID(),
				op: &usecase.Operator{
					AcOperator: &accountusecase.Operator{},
				},
			},
			want:    &interfaces.GuessSchemaFieldsData{},
			wantErr: interfaces.ErrInvalidOperator,
		},
		{
			name: "asset not found",
			args: args{
				assetID: id.NewAssetID(),
				op:      op,
			},
			want:    &interfaces.GuessSchemaFieldsData{},
			wantErr: rerror.ErrNotFound,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			f, _ := fs.NewFile(mockAssetFiles(), "", false)

			for _, a := range tt.seeds.assets {
				err := db.Asset.Save(ctx, a.Clone())
				assert.NoError(t, err)
			}
			for _, m := range tt.seeds.models {
				err := db.Model.Save(ctx, m.Clone())
				assert.NoError(t, err)
			}
			for _, s := range tt.seeds.schema {
				err := db.Schema.Save(ctx, s.Clone())
				assert.NoError(t, err)
			}
			for id, f := range tt.seedFiles {
				err := db.AssetFile.Save(ctx, id, f.Clone())
				assert.Nil(t, err)
			}
			schemaUC := Schema{
				repos: db,
				gateways: &gateway.Container{
					File: f,
				},
			}
			got, err := schemaUC.GuessSchemaFieldsByAsset(context.Background(), tt.args.assetID, tt.args.modelID, tt.args.op)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.wantErr, err)
		})
	}
}

func mockAssetFiles() afero.Fs {
	fileContent1 := []byte(`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "test",
        "height": 123.5,
        "age": 2,
        "is_active": true
      },
      "geometry": {
        "coordinates": [
          106.83394478570801,
          -6.170070705932318
        ],
        "type": "Point"
      }
    }
  ]
}`)
	fileContent2 := []byte(`[
    {
        "name": "John Doe",
        "age": 30,
        "is_active": true,
        "height": 5.9
    }
]`)
	files := map[string][]byte{
		filepath.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "test.geojson"): fileContent1,
		filepath.Join("assets", "50", "30c89f-8f67-4766-b127-49ee6796d464", "test.json"):    fileContent2,
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.Write(content)
		_ = f.Close()
	}
	return fs
}
