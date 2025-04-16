package interactor

import (
	"context"
	"encoding/json"
	"errors"
	"path/filepath"
	"testing"
	"time"

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

func TestAsset_ConvertToSchemaFields(t *testing.T) {
	uid := accountdomain.NewUserID()

	ws := workspace.New().NewID().MustBuild()
	proj1 := project.New().NewID().Workspace(ws.ID()).MustBuild()
	u1 := "5130c89f-8f67-4766-b127-49ee6796d464"
	aid1 := id.NewAssetID()
	a1 := asset.New().ID(aid1).Project(proj1.ID()).UUID(u1).
		CreatedByUser(uid).Size(1000).FileName("test.geojson").MustBuild()
	fileContent1 := []byte(`{
			"type": "Feature",
			"geometry": {
			  "type": "Point",
			  "coordinates": [102.0, 0.5]
			},
			"properties": {
			  "name": "geometry",
			  "elevation": 1500
			}
		  }`)

	af1 := asset.NewFile().
		Name("test.geojson").
		Path("test.geojson").
		ContentType("application/geo+json").
		Size(uint64(len(fileContent1))).
		Build()

	aid2 := id.NewAssetID()
	u2 := "5030c89f-8f67-4766-b127-49ee6796d464"
	a2 := asset.New().ID(aid2).Project(proj1.ID()).UUID(u2).
		CreatedByUser(uid).Size(1000).MustBuild()
	fileContent2 := []byte(`{
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://example.com/product.schema.json",
		"type": "object",
		"properties": {
		  "name": { "type": "string" }
		}
	  }`)
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
		op      *usecase.Operator
	}
	tests := []struct {
		name      string
		args      args
		seeds     []*asset.Asset
		seedFiles map[asset.ID]*asset.File
		want      *interfaces.GuessSchemaFieldsData
		wantErr   error
	}{
		{
			name: "Success GeoJSON file",
			args: args{
				assetID: a1.ID(),
				op:      op,
			},
			seeds: []*asset.Asset{a1},
			seedFiles: map[asset.ID]*asset.File{
				a1.ID(): af1,
			},
			want: &interfaces.GuessSchemaFieldsData{
				Fields: []interfaces.GuessSchemaField{
					{
						Name: "name",
						Type: "string",
						Key:  "name",
					},
				},
				TotalCount: 1,
			},
		},
		{
			name: "Success JSON Schema file",
			args: args{
				assetID: a2.ID(),
				op:      op,
			},
			seeds: []*asset.Asset{a2},
			seedFiles: map[asset.ID]*asset.File{
				a2.ID(): af2,
			},
			want: &interfaces.GuessSchemaFieldsData{
				Fields: []interfaces.GuessSchemaField{
					{
						Name: "name",
						Type: "string",
						Key:  "name",
					},
				},
				TotalCount: 1,
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
			f, _ := fs.NewFile(mockAssetFiles(), "")

			for _, a := range tt.seeds {
				err := db.Asset.Save(ctx, a.Clone())
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
			got, err := schemaUC.GuessSchemaFieldsByAssetID(context.Background(), tt.args.assetID, tt.args.op)
			assert.Equal(t, tt.want, got)
			assert.Equal(t, tt.wantErr, err)
		})
	}
}

func Test_detectFieldType(t *testing.T) {
	tests := []struct {
		name     string
		input    any
		expected string
	}{
		{
			name:     "string type",
			input:    "hello",
			expected: "string",
		},
		{
			name:     "float type",
			input:    3.14,
			expected: "float",
		},
		{
			name:     "integer type",
			input:    float64(10), // float64 that looks like int
			expected: "integer",
		},
		{
			name:     "boolean true",
			input:    true,
			expected: "boolean",
		},
		{
			name:     "boolean false",
			input:    false,
			expected: "boolean",
		},
		{
			name:     "object (map)",
			input:    map[string]interface{}{"key": "value"},
			expected: "object",
		},
		{
			name:     "array (slice)",
			input:    []interface{}{"item1", 2, false},
			expected: "array",
		},
		{
			name:     "unknown (nil)",
			input:    nil,
			expected: "unknown",
		},
		{
			name:     "unknown (custom type)",
			input:    struct{ X int }{X: 1},
			expected: "unknown",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := detectFieldType(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func Test_isJSONSchema(t *testing.T) {
	tests := []struct {
		name     string
		input    map[string]any
		expected bool
	}{
		{
			name: "valid JSON schema",
			input: map[string]any{
				"$schema":    "https://json-schema.org/draft/2020-12/schema",
				"type":       "object",
				"properties": map[string]any{},
			},
			expected: true,
		},
		{
			name: "missing $schema",
			input: map[string]any{
				"type":       "object",
				"properties": map[string]any{},
			},
			expected: false,
		},
		{
			name: "missing properties",
			input: map[string]any{
				"$schema": "https://json-schema.org/draft/2020-12/schema",
				"type":    "object",
			},
			expected: false,
		},
		{
			name: "type is not a string",
			input: map[string]interface{}{
				"$schema":    "https://json-schema.org/draft/2020-12/schema",
				"type":       123,
				"properties": map[string]any{},
			},
			expected: false,
		},
		{
			name: "type is string but not 'object'",
			input: map[string]interface{}{
				"$schema":    "https://json-schema.org/draft/2020-12/schema",
				"type":       "array",
				"properties": map[string]any{},
			},
			expected: false,
		},
		{
			name:     "completely empty map",
			input:    map[string]any{},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := isJSONSchema(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func Test_extractSchemaFieldData(t *testing.T) {
	type args struct {
		contentType string
		content     []byte
	}
	tests := []struct {
		name           string
		args           args
		expectedFields []interfaces.GuessSchemaField
		expectedCount  int
		expectErr      error
	}{
		{
			name: "valid JSON schema",
			args: args{
				contentType: "application/json",
				content: mustMarshal(map[string]any{
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type":    "object",
					"properties": map[string]any{
						"name": map[string]any{"type": "string"},
						"age":  map[string]any{"type": "integer"},
					},
				}),
			},
			expectedFields: []interfaces.GuessSchemaField{
				{Name: "name", Type: "string", Key: "name"},
				{Name: "age", Type: "integer", Key: "age"},
			},
			expectedCount: 2,
			expectErr:     nil,
		},
		{
			name: "invalid JSON schema - missing properties",
			args: args{
				contentType: "application/json",
				content: mustMarshal(map[string]any{
					"$schema": "https://json-schema.org/draft/2020-12/schema",
					"type":    "object",
				}),
			},
			expectedFields: nil,
			expectedCount:  0,
			expectErr:      interfaces.ErrInvalidJSONSchema,
		},
		{
			name: "invalid JSON (unmarshal error)",
			args: args{
				contentType: "application/json",
				content:     []byte(`{ invalid json`),
			},
			expectedFields: nil,
			expectedCount:  0,
			expectErr:      errors.New("invalid"),
		},
		{
			name: "valid GeoJSON with properties",
			args: args{
				contentType: "application/geo+json",
				content: mustMarshal(map[string]any{
					"type": "Feature",
					"geometry": map[string]any{
						"type":        "Point",
						"coordinates": []interface{}{102.0, 0.5},
					},
					"properties": map[string]any{
						"name":        "Mountain",
						"elevation 1": 1500,
						"active":      true,
					},
				}),
			},
			expectedFields: []interfaces.GuessSchemaField{
				{Name: "name", Type: "string", Key: "name"},
				{Name: "elevation 1", Type: "integer", Key: "elevation-1"},
				{Name: "active", Type: "boolean", Key: "active"},
			},
			expectedCount: 3,
			expectErr:     nil,
		},
		{
			name: "invalid geojson (unmarshal error)",
			args: args{
				contentType: "application/geo+json",
				content:     []byte(`{ "type": "Feature", "properties": "not-an-object"`),
			},
			expectedFields: nil,
			expectedCount:  0,
			expectErr:      errors.New("JSON"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := extractSchemaFieldData(tt.args.contentType, tt.args.content)

			if tt.expectErr != nil {
				assert.Error(t, err)
				if !errors.Is(tt.expectErr, interfaces.ErrInvalidJSONSchema) {
					assert.Contains(t, err.Error(), tt.expectErr.Error())
				}
			} else {
				assert.NoError(t, err)
			}

			if got != nil {
				assert.Equal(t, tt.expectedCount, got.TotalCount)
				assert.ElementsMatch(t, tt.expectedFields, got.Fields)
			}
		})
	}
}

func mustMarshal(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}

func mockAssetFiles() afero.Fs {
	fileContent1 := []byte(`{
		"type": "Feature",
		"geometry": {
		  "type": "Point",
		  "coordinates": [102.0, 0.5]
		},
		"properties": {
		  "name": "geometry"
		}
	  }`)
	fileContent2 := []byte(`{
		"$schema": "https://json-schema.org/draft/2020-12/schema",
		"$id": "https://example.com/product.schema.json",
		"type": "object",
		"properties": {
		  "name": { "type": "string" }
		}
	  }`)
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
