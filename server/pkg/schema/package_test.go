package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/stretchr/testify/assert"
)

func TestPackage_New(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, p, &Package{
		schema:       s,
		metaSchema:   meta,
		groupSchemas: groupSchemas,
	})
}

func TestPackage_Schema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, s, p.Schema())
}

func TestPackage_MetaSchema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, meta, p.MetaSchema())
}

func TestPackage_GroupSchemas(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, List{groupSchemas[gID]}, p.GroupSchemas())
}

func TestPackage_GroupSchema(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Equal(t, groupSchemas[gID], p.GroupSchema(gID))
	assert.Nil(t, p.GroupSchema(id.NewGroupID()))
}

func TestPackage_SchemaByID(t *testing.T) {
	mainSchema := &Schema{id: id.NewSchemaID()}
	metaSchema := &Schema{id: id.NewSchemaID()}
	groupSchema := &Schema{id: id.NewSchemaID()}
	referencedSchema := &Schema{id: id.NewSchemaID()}
	groupID := id.NewGroupID()

	p := NewPackage(
		mainSchema,
		metaSchema,
		map[id.GroupID]*Schema{
			groupID: groupSchema,
		},
		List{referencedSchema},
	)

	assert.Equal(t, mainSchema, p.SchemaByID(mainSchema.ID()))
	assert.Equal(t, metaSchema, p.SchemaByID(metaSchema.ID()))
	assert.Equal(t, groupSchema, p.SchemaByID(groupSchema.ID()))
	assert.Equal(t, referencedSchema, p.SchemaByID(referencedSchema.ID()))
	assert.Nil(t, p.SchemaByID(id.NewSchemaID()))
}

func TestPackage_Field(t *testing.T) {
	sID := id.NewSchemaID()
	msID := id.NewSchemaID()
	gsID := id.NewSchemaID()
	gID := id.NewGroupID()
	f1 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f2 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	f3 := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()
	s := &Schema{id: sID, fields: FieldList{f1}}
	meta := &Schema{id: msID, fields: FieldList{f2}}
	groupSchemas := make(map[id.GroupID]*Schema)
	groupSchemas[gID] = &Schema{id: gsID, fields: FieldList{f3}}

	p := NewPackage(s, meta, groupSchemas, nil)

	assert.Nil(t, p.Field(id.NewFieldID()))
	assert.Equal(t, f1, p.Field(f1.ID()))
	assert.Equal(t, f2, p.Field(f2.ID()))
	assert.Equal(t, f3, p.Field(f3.ID()))
}

func TestPackage_FieldsByType(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		pkg      *Package
		typ      value.Type
		expected FieldList
	}{
		{
			name:     "nil package",
			pkg:      nil,
			typ:      value.TypeAsset,
			expected: nil,
		},
		{
			name:     "empty package",
			pkg:      NewPackage(nil, nil, nil, nil),
			typ:      value.TypeAsset,
			expected: FieldList{},
		},
		{
			name: "fields from schema only",
			pkg: func() *Package {
				f1 := &Field{id: NewFieldID(), name: "f1", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
				f2 := &Field{id: NewFieldID(), name: "f2", typeProperty: &TypeProperty{t: value.TypeText, text: NewText(nil)}}
				s := &Schema{id: id.NewSchemaID(), fields: FieldList{f1, f2}}
				return NewPackage(s, nil, nil, nil)
			}(),
			typ: value.TypeAsset,
			expected: func() FieldList {
				f1 := &Field{id: NewFieldID(), name: "f1", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
				return FieldList{f1}
			}(),
		},
		{
			name: "fields from group schemas only",
			pkg: func() *Package {
				gf1 := &Field{id: NewFieldID(), name: "gf1", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
				gf2 := &Field{id: NewFieldID(), name: "gf2", typeProperty: &TypeProperty{t: value.TypeBool, bool: NewBool()}}
				gs := &Schema{id: id.NewSchemaID(), fields: FieldList{gf1, gf2}}
				groupSchemas := map[id.GroupID]*Schema{id.NewGroupID(): gs}
				return NewPackage(nil, nil, groupSchemas, nil)
			}(),
			typ: value.TypeAsset,
			expected: func() FieldList {
				gf1 := &Field{id: NewFieldID(), name: "gf1", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
				return FieldList{gf1}
			}(),
		},
		{
			name: "no matching fields",
			pkg: func() *Package {
				f1 := &Field{id: NewFieldID(), name: "f1", typeProperty: &TypeProperty{t: value.TypeText, text: NewText(nil)}}
				f2 := &Field{id: NewFieldID(), name: "f2", typeProperty: &TypeProperty{t: value.TypeBool, bool: NewBool()}}
				s := &Schema{id: id.NewSchemaID(), fields: FieldList{f1, f2}}
				return NewPackage(s, nil, nil, nil)
			}(),
			typ:      value.TypeAsset,
			expected: FieldList{},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			result := tt.pkg.FieldsByType(tt.typ)
			assert.Equal(t, len(tt.expected), len(result))
		})
	}
}

func TestPackage_SchemaByModel(t *testing.T) {
	t.Parallel()

	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	refModelID := id.NewModelID()
	refSchemaID := id.NewSchemaID()
	otherModelID := id.NewModelID()
	otherSchemaID := id.NewSchemaID()

	refField := NewField(NewReference(refModelID, refSchemaID, nil, nil).TypeProperty()).
		NewID().Key(id.RandomKey()).MustBuild()
	otherRefField := NewField(NewReference(otherModelID, otherSchemaID, nil, nil).TypeProperty()).
		NewID().Key(id.RandomKey()).MustBuild()
	textField := NewField(NewText(nil).TypeProperty()).NewID().Key(id.RandomKey()).MustBuild()

	s := New().NewID().Workspace(wid).Project(pid).Fields(FieldList{refField, otherRefField, textField}).MustBuild()

	refSchema := New().ID(refSchemaID).Workspace(wid).Project(pid).MustBuild()
	otherSchema := New().ID(otherSchemaID).Workspace(wid).Project(pid).MustBuild()
	referencedSchemas := List{refSchema, otherSchema}

	pkg := NewPackage(s, nil, nil, referencedSchemas)

	tests := []struct {
		name     string
		pkg      *Package
		modelID  id.ModelID
		expected *Schema
	}{
		{
			name:     "nil package",
			pkg:      nil,
			modelID:  refModelID,
			expected: nil,
		},
		{
			name:     "matching model returns referenced schema",
			pkg:      pkg,
			modelID:  refModelID,
			expected: refSchema,
		},
		{
			name:     "other matching model returns its schema",
			pkg:      pkg,
			modelID:  otherModelID,
			expected: otherSchema,
		},
		{
			name:     "unknown model returns nil",
			pkg:      pkg,
			modelID:  id.NewModelID(),
			expected: nil,
		},
		{
			name:     "no reference fields returns nil",
			pkg:      NewPackage(New().NewID().Workspace(wid).Project(pid).Fields(FieldList{textField}).MustBuild(), nil, nil, referencedSchemas),
			modelID:  refModelID,
			expected: nil,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := tt.pkg.SchemaByModel(tt.modelID)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestPackage_FieldsByType_Combined(t *testing.T) {
	t.Parallel()

	// Create fields with known IDs for comparison
	sAssetField := &Field{id: NewFieldID(), name: "s_asset", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
	sTextField := &Field{id: NewFieldID(), name: "s_text", typeProperty: &TypeProperty{t: value.TypeText, text: NewText(nil)}}
	schema := &Schema{id: id.NewSchemaID(), fields: FieldList{sAssetField, sTextField}}

	gAssetField := &Field{id: NewFieldID(), name: "g_asset", typeProperty: &TypeProperty{t: value.TypeAsset, asset: NewAsset()}}
	gBoolField := &Field{id: NewFieldID(), name: "g_bool", typeProperty: &TypeProperty{t: value.TypeBool, bool: NewBool()}}
	groupSchema := &Schema{id: id.NewSchemaID(), fields: FieldList{gAssetField, gBoolField}}
	groupSchemas := map[id.GroupID]*Schema{id.NewGroupID(): groupSchema}

	pkg := NewPackage(schema, nil, groupSchemas, nil)

	// Test TypeAsset - should return fields from both schema and group schemas
	assetFields := pkg.FieldsByType(value.TypeAsset)
	assert.Len(t, assetFields, 2)
	assert.Contains(t, assetFields, sAssetField)
	assert.Contains(t, assetFields, gAssetField)

	// Test TypeText - should return only schema text field
	textFields := pkg.FieldsByType(value.TypeText)
	assert.Len(t, textFields, 1)
	assert.Contains(t, textFields, sTextField)

	// Test TypeBool - should return only group schema bool field
	boolFields := pkg.FieldsByType(value.TypeBool)
	assert.Len(t, boolFields, 1)
	assert.Contains(t, boolFields, gBoolField)

	// Test TypeNumber - should return empty list
	numberFields := pkg.FieldsByType(value.TypeNumber)
	assert.Len(t, numberFields, 0)
}
