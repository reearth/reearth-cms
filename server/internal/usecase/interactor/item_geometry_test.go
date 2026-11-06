package interactor

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountusecase"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestItem_Create_GeometryUnique(t *testing.T) {
	t.Parallel()

	line := `{"type":"LineString","coordinates":[[139.7,35.6],[139.8,35.7]]}`
	reversedLine := `{"type":"LineString","coordinates":[[139.8,35.7],[139.7,35.6]]}`
	point := `{"type":"Point","coordinates":[139.7,35.6]}`
	closePoint := `{"type":"Point","coordinates":[139.7000001,35.6]}`
	multiPoint := `{"type":"MultiPoint","coordinates":[[139.7,35.6]]}`

	tests := []struct {
		name     string
		multiple bool
		existing []any
		value    any
		wantErr  bool
	}{
		{name: "same value", existing: []any{line}, value: line, wantErr: true},
		{name: "same value as an object", existing: []any{line}, value: map[string]any{"type": "LineString", "coordinates": []any{[]any{139.70, 35.60}, []any{139.8, 35.7}}}, wantErr: true},
		{name: "reversed line string", existing: []any{line}, value: reversedLine, wantErr: true},
		{name: "close points are different", existing: []any{point}, value: closePoint},
		{name: "point and multi point are different", existing: []any{point}, value: multiPoint},
		{name: "multiple: same values", multiple: true, existing: []any{point, line}, value: []any{point, reversedLine}, wantErr: true},
		{name: "multiple: values in another order", multiple: true, existing: []any{point, line}, value: []any{line, point}},
		{name: "multiple: subset of the values", multiple: true, existing: []any{point, line}, value: []any{point}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			ctx := context.Background()
			wid := accountdomain.NewWorkspaceID()
			prj := project.New().NewID().Workspace(wid).MustBuild()
			sf := schema.NewField(schema.NewGeometry().TypeProperty()).NewID().Name("geo").Unique(true).Multiple(tt.multiple).Key(id.RandomKey()).MustBuild()
			s := schema.New().NewID().Workspace(wid).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
			m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(prj.ID()).MustBuild()
			existing := item.New().NewID().Anonymous(true).Model(m.ID()).Project(prj.ID()).Schema(s.ID()).Thread(id.NewThreadID().Ref()).
				Fields([]*item.Field{item.NewField(sf.ID(), value.NewMultiple(value.TypeGeometry, tt.existing), nil)}).
				MustBuild()

			db := memory.New()
			require.NoError(t, db.Project.Save(ctx, prj))
			require.NoError(t, db.Schema.Save(ctx, s))
			require.NoError(t, db.Model.Save(ctx, m))
			require.NoError(t, db.Item.Save(ctx, existing))

			uc := NewItem(db, nil)
			uc.ignoreEvent = true
			op := &usecase.Operator{
				AcOperator: &accountusecase.Operator{
					User:               accountdomain.NewUserID().Ref(),
					ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
					WritableWorkspaces: []accountdomain.WorkspaceID{wid},
				},
				ReadableProjects: []id.ProjectID{prj.ID()},
				WritableProjects: []id.ProjectID{prj.ID()},
			}

			got, err := uc.Create(ctx, interfaces.CreateItemParam{
				SchemaID: s.ID(),
				ModelID:  m.ID(),
				Fields:   item.FieldInputList{{Field: sf.ID().Ref(), Value: tt.value}},
			}, op)

			if tt.wantErr {
				assert.Equal(t, schema.FieldValidationErrors{{Field: sf.ID().Ref(), Key: sf.Key().Ref(), Code: schema.FieldValidationCodeUnique, Detail: interfaces.ErrDuplicatedItemValue}}, err)
				assert.Nil(t, got)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, value.TypeGeometry, got.Value().Field(sf.ID()).Type())
		})
	}
}

func TestItem_Create_GeometryValidation(t *testing.T) {
	t.Parallel()

	ctx := context.Background()
	wid := accountdomain.NewWorkspaceID()
	prj := project.New().NewID().Workspace(wid).MustBuild()
	sf := schema.NewField(schema.NewGeometry().TypeProperty()).NewID().Name("geo").Key(id.RandomKey()).MustBuild()
	s := schema.New().NewID().Workspace(wid).Project(prj.ID()).Fields(schema.FieldList{sf}).MustBuild()
	m := model.New().NewID().Schema(s.ID()).Key(id.RandomKey()).Project(prj.ID()).MustBuild()

	db := memory.New()
	require.NoError(t, db.Project.Save(ctx, prj))
	require.NoError(t, db.Schema.Save(ctx, s))
	require.NoError(t, db.Model.Save(ctx, m))

	uc := NewItem(db, nil)
	uc.ignoreEvent = true
	op := &usecase.Operator{
		AcOperator: &accountusecase.Operator{
			User:               accountdomain.NewUserID().Ref(),
			ReadableWorkspaces: []accountdomain.WorkspaceID{wid},
			WritableWorkspaces: []accountdomain.WorkspaceID{wid},
		},
		ReadableProjects: []id.ProjectID{prj.ID()},
		WritableProjects: []id.ProjectID{prj.ID()},
	}

	_, err := uc.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields:   item.FieldInputList{{Field: sf.ID().Ref(), Value: `{"type":"Point","coordinates":[35.6,139.7]}`}},
	}, op)
	assert.Equal(t, schema.FieldValidationErrors{{Field: sf.ID().Ref(), Key: sf.Key().Ref(), Code: schema.FieldValidationCodeInvalidGeoStructure, Detail: schema.ErrGeometryReversedCoordinates}}, err)

	_, err = uc.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields: item.FieldInputList{{Field: sf.ID().Ref(), Value: map[string]any{
			"type":       "GeometryCollection",
			"geometries": []any{map[string]any{"type": "GeometryCollection", "geometries": []any{}}},
		}}},
	}, op)
	assert.Equal(t, schema.FieldValidationErrors{{Field: sf.ID().Ref(), Key: sf.Key().Ref(), Code: schema.FieldValidationCodeInvalidGeoStructure, Detail: schema.ErrGeometryNestedCollection}}, err)

	got, err := uc.Create(ctx, interfaces.CreateItemParam{
		SchemaID: s.ID(),
		ModelID:  m.ID(),
		Fields:   item.FieldInputList{{Field: sf.ID().Ref(), Value: `{"type":"Point","coordinates":[139.7,35.6]}`}},
	}, op)
	require.NoError(t, err)
	assert.Equal(t, value.Geometry{"type": "Point", "coordinates": []any{139.7, 35.6}}, got.Value().Field(sf.ID()).Value().First().Interface())
}
