package exporters

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestBuildProperties(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	// text field
	fId1 := id.NewFieldID()
	sfKey1 := id.RandomKey()
	sf1 := schema.NewField(schema.NewText(lo.ToPtr(100)).TypeProperty()).ID(fId1).Key(sfKey1).MustBuild()

	// number field
	fId2 := id.NewFieldID()
	sfKey2 := id.RandomKey()
	intField, err := schema.NewInteger(lo.ToPtr(int64(1)), lo.ToPtr(int64(100)))
	assert.NoError(t, err)
	sf2 := schema.NewField(intField.TypeProperty()).ID(fId2).Key(sfKey2).MustBuild()

	// asset field
	gsfKey := id.NewKey("asset-key")
	gsfId2 := id.NewFieldID()
	gsf := schema.NewField(schema.NewAsset().TypeProperty()).ID(gsfId2).Key(gsfKey).Multiple(true).MustBuild()

	// group schema
	gs := schema.New().ID(id.NewSchemaID()).Workspace(wid).Project(pid).Fields([]*schema.Field{gsf}).MustBuild()

	// group
	gid := id.NewGroupID()
	gkey := id.RandomKey()
	g := group.New().ID(gid).Name("group").Project(pid).Key(gkey).Schema(gs.ID()).MustBuild()

	// group field
	fId3 := id.NewFieldID()
	sfKey3 := id.NewKey("group-key")
	sf3 := schema.NewField(schema.NewGroup(g.ID()).TypeProperty()).ID(fId3).Key(sfKey3).Multiple(true).MustBuild()

	// bool field
	fId4 := id.NewFieldID()
	sfKey4 := id.RandomKey()
	sf4 := schema.NewField(schema.NewBool().TypeProperty()).ID(fId4).Key(sfKey4).MustBuild()

	// date field
	fId5 := id.NewFieldID()
	sfKey5 := id.RandomKey()
	sf5 := schema.NewField(schema.NewDateTime().TypeProperty()).ID(fId5).Key(sfKey5).MustBuild()

	// url field
	fId6 := id.NewFieldID()
	sfKey6 := id.RandomKey()
	sf6 := schema.NewField(schema.NewURL().TypeProperty()).ID(fId6).Key(sfKey6).MustBuild()

	fieldList := schema.FieldList{sf1, sf2, sf3, sf4, sf5, sf6}
	gsMap := map[id.GroupID]*schema.Schema{gid: gs}

	expectedProperties := map[string]types.JSONSchema{
		sfKey1.String(): {
			Type:      "string",
			FieldType: "text",
			MaxLength: lo.ToPtr(100),
		},
		sfKey2.String(): {
			Type:      "integer",
			FieldType: "integer",
			Minimum:   lo.ToPtr(float64(1)),
			Maximum:   lo.ToPtr(float64(100)),
		},
		sfKey3.String(): {
			Type:      "array",
			FieldType: "group",
			Multiple:  true,
			Items: &types.JSONSchema{
				Type: "object",
				Properties: map[string]types.JSONSchema{
					"asset-key": {
						Format:    lo.ToPtr("binary"),
						Type:      "string",
						FieldType: "asset",
						Multiple:  true,
					},
				}},
		},
		sfKey4.String(): {
			Type:      "boolean",
			FieldType: "bool",
		},
		sfKey5.String(): {
			Type:      "string",
			FieldType: "datetime",
			Format:    lo.ToPtr("date-time"),
		},
		sfKey6.String(): {
			Type:      "string",
			FieldType: "url",
			Format:    lo.ToPtr("uri"),
		},
	}

	properties := buildPropertiesMap(fieldList, gsMap)
	assert.Equal(t, expectedProperties, properties)
}

func TestDetermineTypeAndFormat(t *testing.T) {
	tests := []struct {
		input         value.Type
		wantFieldType string
		wantType      string
		wantFmt       string
	}{
		{value.TypeText, "text", "string", ""},
		{value.TypeTextArea, "textArea", "string", ""},
		{value.TypeRichText, "richText", "string", ""},
		{value.TypeMarkdown, "markdown", "string", ""},
		{value.TypeSelect, "select", "string", ""},
		{value.TypeTag, "tag", "string", ""},
		{value.TypeReference, "reference", "string", ""},
		{value.TypeInteger, "integer", "integer", ""},
		{value.TypeNumber, "number", "number", ""},
		{value.TypeBool, "bool", "boolean", ""},
		{value.TypeDateTime, "datetime", "string", "date-time"},
		{value.TypeURL, "url", "string", "uri"},
		{value.TypeAsset, "asset", "string", "binary"},
		{value.TypeGroup, "group", "array", ""},
		{value.TypeGeometryObject, "geometryObject", "object", ""},
		{value.TypeGeometryEditor, "geometryEditor", "object", ""},
		{"unknown", "", "string", ""},
	}

	for _, tt := range tests {
		t.Run(string(tt.input), func(t *testing.T) {
			gotFieldType, gotType, gotFmt := determineFTypeAndTypeAndFormat(tt.input)
			assert.Equal(t, tt.wantFieldType, gotFieldType)
			assert.Equal(t, tt.wantType, gotType)
			assert.Equal(t, tt.wantFmt, gotFmt)
		})
	}
}

func TestBuildGroupSchemaMap(t *testing.T) {
	wid := accountdomain.NewWorkspaceID()
	pid := id.NewProjectID()

	textFieldID := id.NewFieldID()
	textFieldKey := id.RandomKey()
	textField := schema.NewField(schema.NewText(lo.ToPtr(100)).TypeProperty()).ID(textFieldID).Key(textFieldKey).MustBuild()

	assetField1 := schema.NewField(schema.NewAsset().TypeProperty()).ID(id.NewFieldID()).Key(id.NewKey("asset-key-1")).Multiple(true).MustBuild()
	groupSchema1 := schema.New().ID(id.NewSchemaID()).Workspace(wid).Project(pid).Fields([]*schema.Field{assetField1}).MustBuild()

	groupID1 := id.NewGroupID()
	groupKey1 := id.RandomKey()
	group1 := group.New().ID(groupID1).Name("group-1").Project(pid).Key(groupKey1).Schema(groupSchema1.ID()).MustBuild()

	groupFieldID1 := id.NewFieldID()
	groupFieldKey1 := id.NewKey("group-key-1")
	groupField1 := schema.NewField(schema.NewGroup(group1.ID()).TypeProperty()).ID(groupFieldID1).Key(groupFieldKey1).Multiple(true).MustBuild()

	textField2 := schema.NewField(schema.NewText(nil).TypeProperty()).ID(id.NewFieldID()).Key(id.NewKey("text-key-2")).Multiple(false).MustBuild()
	groupSchema2 := schema.New().ID(id.NewSchemaID()).Workspace(wid).Project(pid).Fields([]*schema.Field{textField2}).MustBuild()

	groupID2 := id.NewGroupID()
	groupKey2 := id.RandomKey()
	group2 := group.New().ID(groupID2).Name("group-2").Project(pid).Key(groupKey2).Schema(groupSchema2.ID()).MustBuild()

	groupFieldID2 := id.NewFieldID()
	groupFieldKey2 := id.NewKey("group-key-2")
	groupField2 := schema.NewField(schema.NewGroup(group2.ID()).TypeProperty()).ID(groupFieldID2).Key(groupFieldKey2).Multiple(false).MustBuild()

	mainSchema := schema.New().ID(id.NewSchemaID()).Workspace(wid).Project(pid).Fields([]*schema.Field{textField, groupField1, groupField2}).MustBuild()
	schemaPackage := schema.NewPackage(mainSchema, nil, map[id.GroupID]*schema.Schema{groupID1: groupSchema1, groupID2: groupSchema2}, nil)

	expected := map[id.GroupID]*schema.Schema{groupID1: groupSchema1, groupID2: groupSchema2}
	result := buildGroupSchemaMap(schemaPackage)
	assert.Equal(t, expected, result)
}

func TestBuildPropertiesExtended(t *testing.T) {
	t.Parallel()

	intTypeProperty, _ := schema.NewInteger(nil, nil)

	tests := []struct {
		name     string
		field    *schema.Field
		expected types.JSONSchema
	}{
		{
			name: "geometry editor with supported types",
			field: schema.NewField(schema.NewGeometryEditor(schema.GeometryEditorSupportedTypeList{
				schema.GeometryEditorSupportedTypePoint,
				schema.GeometryEditorSupportedTypeLineString,
			}).TypeProperty()).ID(id.NewFieldID()).Key(id.NewKey("geo-editor")).MustBuild(),
			expected: types.JSONSchema{
				Type:             "object",
				FieldType:        "geometryEditor",
				GeoSupportedType: lo.ToPtr("POINT"),
			},
		},
		{
			name: "geometry editor with empty supported types",
			field: schema.NewField(schema.NewGeometryEditor(schema.GeometryEditorSupportedTypeList{}).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("geo-editor-empty")).MustBuild(),
			expected: types.JSONSchema{
				Type:      "object",
				FieldType: "geometryEditor",
			},
		},
		{
			name: "geometry object with supported types",
			field: schema.NewField(schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{
				schema.GeometryObjectSupportedTypePoint,
				schema.GeometryObjectSupportedTypePolygon,
			}).TypeProperty()).ID(id.NewFieldID()).Key(id.NewKey("geo-object")).MustBuild(),
			expected: types.JSONSchema{
				Type:              "object",
				FieldType:         "geometryObject",
				GeoSupportedTypes: lo.ToPtr([]string{"POINT", "POLYGON"}),
			},
		},
		{
			name: "geometry object with empty supported types",
			field: schema.NewField(schema.NewGeometryObject(schema.GeometryObjectSupportedTypeList{}).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("geo-object-empty")).MustBuild(),
			expected: types.JSONSchema{
				Type:      "object",
				FieldType: "geometryObject",
			},
		},
		{
			name: "select field with options",
			field: schema.NewField(schema.NewSelect([]string{"draft", "published", "archived"}).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("status")).MustBuild(),
			expected: types.JSONSchema{
				Type:      "string",
				FieldType: "select",
				Options:   lo.ToPtr([]string{"draft", "published", "archived"}),
			},
		},
		{
			name: "text field with default value",
			field: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("text-default")).
				DefaultValue(value.TypeText.Value("default text").AsMultiple()).MustBuild(),
			expected: types.JSONSchema{
				Type:         "string",
				FieldType:    "text",
				DefaultValue: "default text",
			},
		},
		{
			name: "bool field with default value",
			field: schema.NewField(schema.NewBool().TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("bool-default")).
				DefaultValue(value.TypeBool.Value(true).AsMultiple()).MustBuild(),
			expected: types.JSONSchema{
				Type:         "boolean",
				FieldType:    "bool",
				DefaultValue: true,
			},
		},
		{
			name: "integer field with default value",
			field: schema.NewField(intTypeProperty.TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("int-default")).
				DefaultValue(value.TypeInteger.Value(int64(42)).AsMultiple()).MustBuild(),
			expected: types.JSONSchema{
				Type:         "integer",
				FieldType:    "integer",
				DefaultValue: int64(42),
			},
		},
		{
			name: "multiple text field with default values",
			field: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("multi-text")).Multiple(true).
				DefaultValue(value.NewMultiple(value.TypeText, []any{"value1", "value2"})).MustBuild(),
			expected: types.JSONSchema{
				Type:         "string",
				FieldType:    "text",
				Multiple:     true,
				DefaultValue: []any{"value1", "value2"},
			},
		},
		{
			name: "required field",
			field: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("required-field")).Required(true).MustBuild(),
			expected: types.JSONSchema{
				Type:      "string",
				FieldType: "text",
				Required:  true,
			},
		},
		{
			name: "unique field",
			field: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("unique-field")).Unique(true).MustBuild(),
			expected: types.JSONSchema{
				Type:      "string",
				FieldType: "text",
				Unique:    true,
			},
		},
		{
			name: "required and unique field",
			field: schema.NewField(schema.NewText(nil).TypeProperty()).
				ID(id.NewFieldID()).Key(id.NewKey("required-unique")).Required(true).Unique(true).MustBuild(),
			expected: types.JSONSchema{
				Type:      "string",
				FieldType: "text",
				Required:  true,
				Unique:    true,
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			fieldList := schema.FieldList{tt.field}
			properties := buildPropertiesMap(fieldList, nil)

			assert.Equal(t, tt.expected, properties[tt.field.Key().String()])
		})
	}
}
