package integration

import (
	"context"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/infrastructure/memory"
	"github.com/reearth/reearth-cms/server/internal/usecase/interactor"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestBuildProperties(t *testing.T) {
	ctx := context.Background()
	r := memory.New()
	uc := &interfaces.Container{Schema: interactor.NewSchema(r, nil)}

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
	lo.Must0(r.Schema.Save(ctx, gs))

	// group
	gid := id.NewGroupID()
	gkey := id.RandomKey()
	g := group.New().ID(gid).Name("group").Project(pid).Key(gkey).Schema(gs.ID()).MustBuild()
	lo.Must0(r.Group.Save(ctx, g))

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
	s1 := schema.New().NewID().Workspace(wid).Project(pid).Fields(schema.FieldList{sf2}).MustBuild()
	lo.Must0(r.Schema.Save(ctx, s1))

	expectedProperties := map[string]interface{}{
		sfKey1.String(): map[string]interface{}{
			"type":        "string",
			"title":       "",
			"description": "",
			"maxLength":   100,
		},
		sfKey2.String(): map[string]interface{}{
			"type":        "integer",
			"title":       "",
			"description": "",
			"minimum":     int64(1),
			"maximum":     int64(100),
		},
		sfKey3.String(): map[string]interface{}{
			"title":       "",
			"type":        "array",
			"description": "",
			"items": map[string]interface{}{
				"asset-key": map[string]interface{}{
					"description": "",
					"format":      "binary",
					"title":       "",
					"type":        "string",
				},
			},
		},
		sfKey4.String(): map[string]interface{}{
			"type":        "boolean",
			"title":       "",
			"description": "",
		},
		sfKey5.String(): map[string]interface{}{
			"type":        "string",
			"title":       "",
			"description": "",
			"format":      "date-time",
		},
		sfKey6.String(): map[string]interface{}{
			"type":        "string",
			"title":       "",
			"description": "",
			"format":      "uri",
		},
	}

	properties := buildProperties(uc, fieldList, ctx)
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
