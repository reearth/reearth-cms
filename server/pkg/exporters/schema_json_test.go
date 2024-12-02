package exporters

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
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

	expectedProperties := map[string]SchemaJSONProperties{
		sfKey1.String(): {
			Type:      "string",
			MaxLength: lo.ToPtr(100),
		},
		sfKey2.String(): {
			Type:    "integer",
			Minimum: lo.ToPtr(float64(1)),
			Maximum: lo.ToPtr(float64(100)),
		},
		sfKey3.String(): {
			Type: "array",
			Items: &SchemaJSON{
				Type: "object",
				Properties: map[string]SchemaJSONProperties{
					"asset-key": {
						Format: lo.ToPtr("binary"),
						Type:   "string",
					},
				}},
		},
		sfKey4.String(): {
			Type: "boolean",
		},
		sfKey5.String(): {
			Type:   "string",
			Format: lo.ToPtr("date-time"),
		},
		sfKey6.String(): {
			Type:   "string",
			Format: lo.ToPtr("uri"),
		},
	}

	properties := BuildProperties(fieldList, gsMap)
	assert.Equal(t, expectedProperties, properties)
}

func TestDetermineTypeAndFormat(t *testing.T) {
	tests := []struct {
		input    value.Type
		wantType string
		wantFmt  string
	}{
		{value.TypeText, "string", ""},
		{value.TypeTextArea, "string", ""},
		{value.TypeRichText, "string", ""},
		{value.TypeMarkdown, "string", ""},
		{value.TypeSelect, "string", ""},
		{value.TypeTag, "string", ""},
		{value.TypeReference, "string", ""},
		{value.TypeInteger, "integer", ""},
		{value.TypeNumber, "number", ""},
		{value.TypeBool, "boolean", ""},
		{value.TypeDateTime, "string", "date-time"},
		{value.TypeURL, "string", "uri"},
		{value.TypeAsset, "string", "binary"},
		{value.TypeGroup, "array", ""},
		{value.TypeGeometryObject, "object", ""},
		{value.TypeGeometryEditor, "object", ""},
		{"unknown", "string", ""},
	}

	for _, tt := range tests {
		t.Run(string(tt.input), func(t *testing.T) {
			gotType, gotFmt := determineTypeAndFormat(tt.input)
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
	result := BuildGroupSchemaMap(schemaPackage)
	assert.Equal(t, expected, result)
}
