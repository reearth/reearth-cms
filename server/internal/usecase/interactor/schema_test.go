package interactor

import (
	"context"
	"errors"
	"path/filepath"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway/gatewaymock"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/rbac"
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

func TestSchema_FindByID_CheckPermission(t *testing.T) {

	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newS := func() *schema.Schema {
		wid := accountdomain.NewWorkspaceID()
		return schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).MustBuild()
	}

	sFind := newS()
	sAllowed := newS()
	sDenied := newS()
	sError := newS()

	tests := []struct {
		name      string
		seeds     schema.List
		id        id.SchemaID
		operator  *usecase.Operator
		want      *schema.Schema
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "find without auth gateway",
			seeds:    schema.List{sFind},
			id:       sFind.ID(),
			operator: op,
			want:     sFind,
		},
		{
			name:     "not found without auth gateway",
			seeds:    schema.List{},
			id:       id.NewSchemaID(),
			operator: op,
			wantErr:  rerror.ErrNotFound,
		},
		{
			name:     "permission allowed",
			seeds:    schema.List{sAllowed},
			id:       sAllowed.ID(),
			operator: op,
			want:     sAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			seeds:    schema.List{sDenied},
			id:       sDenied.ID(),
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			seeds:    schema.List{sError},
			id:       sError.ID(),
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			db := memory.New()
			for _, s := range tc.seeds {
				assert.NoError(t, db.Schema.Save(ctx, s))
			}

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			schemaUC := NewSchema(db, gateways)
			got, err := schemaUC.FindByID(ctx, tc.id, tc.operator)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
		})
	}
}

func TestSchema_CreateField_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newS := func() *schema.Schema {
		return schema.New().NewID().Workspace(wid).Project(p.ID()).MustBuild()
	}

	sAllowed := newS()
	sDenied := newS()
	sError := newS()

	param := interfaces.CreateFieldParam{
		SchemaID:     id.NewSchemaID(), // overridden per test case
		Type:         value.TypeBool,
		Name:         "test field",
		Key:          "testfield",
		Multiple:     false,
		Unique:       false,
		Required:     false,
		IsTitle:      false,
		TypeProperty: schema.NewBool().TypeProperty(),
	}

	makeParam := func(sid id.SchemaID) interfaces.CreateFieldParam {
		p := param
		p.SchemaID = sid
		return p
	}

	tests := []struct {
		name      string
		seeds     schema.List
		param     interfaces.CreateFieldParam
		operator  *usecase.Operator
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "permission allowed",
			seeds:    schema.List{sAllowed},
			param:    makeParam(sAllowed.ID()),
			operator: op,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied - returns error",
			seeds:    schema.List{sDenied},
			param:    makeParam(sDenied.ID()),
			operator: op,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error - returns error",
			seeds:    schema.List{sError},
			param:    makeParam(sError.ID()),
			operator: op,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
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
			for _, s := range tc.seeds {
				assert.NoError(t, db.Schema.Save(ctx, s))
			}

			var gateways *gateway.Container
			if tc.setupAuth != nil {
				ctrl := gomock.NewController(t)
				mockAuth := gatewaymock.NewMockAuthorization(ctrl)
				tc.setupAuth(mockAuth)
				gateways = &gateway.Container{Authorization: mockAuth}
			}

			schemaUC := NewSchema(db, gateways)
			got, err := schemaUC.CreateField(ctx, tc.param, tc.operator)
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

func TestSchema_FindByIDs_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newS := func() *schema.Schema {
		return schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).MustBuild()
	}
	sAllowed := newS()
	sDenied := newS()
	sError := newS()

	tests := []struct {
		name      string
		seeds     schema.List
		ids       []id.SchemaID
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:  "permission allowed",
			seeds: schema.List{sAllowed},
			ids:   []id.SchemaID{sAllowed.ID()},
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionList, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			seeds:   schema.List{sDenied},
			ids:     []id.SchemaID{sDenied.ID()},
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionList, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			seeds:   schema.List{sError},
			ids:     []id.SchemaID{sError.ID()},
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionList, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			for _, s := range tc.seeds {
				assert.NoError(t, db.Schema.Save(ctx, s))
			}

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.FindByIDs(ctx, tc.ids, op)
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

func TestSchema_FindByModel_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*model.Model, *schema.Schema) {
		sid := id.NewSchemaID()
		s := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
		m := model.New().NewID().Project(pid).Schema(sid).Key(id.RandomKey()).MustBuild()
		return m, s
	}
	mAllowed, sAllowed := newFixture()
	mDenied, sDenied := newFixture()
	mError, sError := newFixture()

	tests := []struct {
		name      string
		model     *model.Model
		schema    *schema.Schema
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:   "permission allowed",
			model:  mAllowed,
			schema: sAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			model:   mDenied,
			schema:  sDenied,
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			model:   mError,
			schema:  sError,
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Model.Save(ctx, tc.model.Clone()))
			assert.NoError(t, db.Schema.Save(ctx, tc.schema))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.FindByModel(ctx, tc.model.ID(), op)
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

func TestSchema_FindByGroup_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*group.Group, *schema.Schema) {
		sid := id.NewSchemaID()
		s := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
		g := group.New().NewID().Project(pid).Schema(sid).Key(id.RandomKey()).MustBuild()
		return g, s
	}
	gAllowed, sAllowed := newFixture()
	gDenied, sDenied := newFixture()
	gError, sError := newFixture()

	tests := []struct {
		name      string
		group     *group.Group
		schema    *schema.Schema
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:   "permission allowed",
			group:  gAllowed,
			schema: sAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			group:   gDenied,
			schema:  sDenied,
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			group:   gError,
			schema:  sError,
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Group.Save(ctx, tc.group))
			assert.NoError(t, db.Schema.Save(ctx, tc.schema))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.FindByGroup(ctx, tc.group.ID(), op)
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

func TestSchema_FindByGroups_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*group.Group, *schema.Schema) {
		sid := id.NewSchemaID()
		s := schema.New().ID(sid).Workspace(wid).Project(pid).MustBuild()
		g := group.New().NewID().Project(pid).Schema(sid).Key(id.RandomKey()).MustBuild()
		return g, s
	}
	gAllowed, sAllowed := newFixture()
	gDenied, sDenied := newFixture()
	gError, sError := newFixture()

	tests := []struct {
		name      string
		group     *group.Group
		schema    *schema.Schema
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:   "permission allowed",
			group:  gAllowed,
			schema: sAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			group:   gDenied,
			schema:  sDenied,
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			group:   gError,
			schema:  sError,
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Group.Save(ctx, tc.group))
			assert.NoError(t, db.Schema.Save(ctx, tc.schema))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.FindByGroups(ctx, id.GroupIDList{tc.group.ID()}, op)
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

func TestSchema_GetSchemasAndGroupSchemasByIDs_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newS := func() *schema.Schema {
		return schema.New().NewID().Workspace(wid).Project(id.NewProjectID()).MustBuild()
	}
	sAllowed := newS()
	sDenied := newS()
	sError := newS()

	tests := []struct {
		name      string
		seed      *schema.Schema
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name: "permission allowed",
			seed: sAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			seed:    sDenied,
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			seed:    sError,
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionRead, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
			},
		},
	}

	for _, tc := range tests {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()
			ctx := context.Background()
			db := memory.New()
			assert.NoError(t, db.Schema.Save(ctx, tc.seed))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			schemas, groupSchemas, err := schemaUC.GetSchemasAndGroupSchemasByIDs(ctx, id.SchemaIDList{tc.seed.ID()}, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				assert.Nil(t, schemas)
				assert.Nil(t, groupSchemas)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, schemas)
		})
	}
}

func TestSchema_UpdateField_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*schema.Schema, id.FieldID) {
		fid := id.NewFieldID()
		f := schema.NewField(schema.NewBool().TypeProperty()).ID(fid).Key(id.RandomKey()).MustBuild()
		s := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{f}).MustBuild()
		return s, fid
	}
	sAllowed, fidAllowed := newFixture()
	sDenied, fidDenied := newFixture()
	sError, fidError := newFixture()

	makeParam := func(s *schema.Schema, fid id.FieldID) interfaces.UpdateFieldParam {
		return interfaces.UpdateFieldParam{
			SchemaID:     s.ID(),
			FieldID:      fid,
			TypeProperty: schema.NewBool().TypeProperty(),
		}
	}

	tests := []struct {
		name      string
		seed      *schema.Schema
		param     interfaces.UpdateFieldParam
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:  "permission allowed",
			seed:  sAllowed,
			param: makeParam(sAllowed, fidAllowed),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			seed:    sDenied,
			param:   makeParam(sDenied, fidDenied),
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			seed:    sError,
			param:   makeParam(sError, fidError),
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
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
			assert.NoError(t, db.Schema.Save(ctx, tc.seed))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.UpdateField(ctx, tc.param, op)
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

func TestSchema_DeleteField_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*schema.Schema, id.FieldID) {
		fid := id.NewFieldID()
		f := schema.NewField(schema.NewBool().TypeProperty()).ID(fid).Key(id.RandomKey()).MustBuild()
		s := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{f}).MustBuild()
		return s, fid
	}
	sAllowed, fidAllowed := newFixture()
	sDenied, fidDenied := newFixture()
	sError, fidError := newFixture()

	tests := []struct {
		name      string
		seed      *schema.Schema
		schemaID  id.SchemaID
		fieldID   id.FieldID
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:     "permission allowed",
			seed:     sAllowed,
			schemaID: sAllowed.ID(),
			fieldID:  fidAllowed,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:     "permission denied",
			seed:     sDenied,
			schemaID: sDenied.ID(),
			fieldID:  fidDenied,
			wantErr:  interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:     "permission check error",
			seed:     sError,
			schemaID: sError.ID(),
			fieldID:  fidError,
			wantErr:  errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
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
			assert.NoError(t, db.Schema.Save(ctx, tc.seed))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			err := schemaUC.DeleteField(ctx, tc.schemaID, tc.fieldID, op)
			if tc.wantErr != nil {
				assert.EqualError(t, err, tc.wantErr.Error())
				return
			}
			assert.NoError(t, err)
		})
	}
}

func TestSchema_UpdateFields_CheckPermission(t *testing.T) {

	wid := accountdomain.NewWorkspaceID()
	p := project.New().NewID().Workspace(wid).MustBuild()
	op := &usecase.Operator{
		OwningProjects: []id.ProjectID{p.ID()},
		AcOperator: &accountusecase.Operator{
			User: accountdomain.NewUserID().Ref(),
		},
	}

	newFixture := func() (*schema.Schema, id.FieldID) {
		fid := id.NewFieldID()
		f := schema.NewField(schema.NewBool().TypeProperty()).ID(fid).Key(id.RandomKey()).MustBuild()
		s := schema.New().NewID().Workspace(wid).Project(p.ID()).Fields([]*schema.Field{f}).MustBuild()
		return s, fid
	}
	sAllowed, fidAllowed := newFixture()
	sDenied, fidDenied := newFixture()
	sError, fidError := newFixture()

	makeParams := func(fid id.FieldID) []interfaces.UpdateFieldParam {
		return []interfaces.UpdateFieldParam{{FieldID: fid, TypeProperty: schema.NewBool().TypeProperty()}}
	}

	tests := []struct {
		name      string
		seed      *schema.Schema
		params    []interfaces.UpdateFieldParam
		wantErr   error
		setupAuth func(mock *gatewaymock.MockAuthorization)
	}{
		{
			name:   "permission allowed",
			seed:   sAllowed,
			params: makeParams(fidAllowed),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(true, nil)
			},
		},
		{
			name:    "permission denied",
			seed:    sDenied,
			params:  makeParams(fidDenied),
			wantErr: interfaces.ErrOperationDenied,
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, nil)
			},
		},
		{
			name:    "permission check error",
			seed:    sError,
			params:  makeParams(fidError),
			wantErr: errors.New("cerbos unavailable"),
			setupAuth: func(mock *gatewaymock.MockAuthorization) {
				mock.EXPECT().CheckPermission(gomock.Any(), rbac.ResourceSchema, rbac.ActionUpdate, gomock.Any()).Return(false, errors.New("cerbos unavailable"))
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
			assert.NoError(t, db.Schema.Save(ctx, tc.seed))

			ctrl := gomock.NewController(t)
			mockAuth := gatewaymock.NewMockAuthorization(ctrl)
			tc.setupAuth(mockAuth)
			schemaUC := NewSchema(db, &gateway.Container{Authorization: mockAuth})

			got, err := schemaUC.UpdateFields(ctx, tc.seed.ID(), tc.params, op)
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
