package integrationapi

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToGeometryType(t *testing.T) {
	tests := []struct {
		input    *exporters.GeometryType
		expected *GeometryType
	}{
		{
			input:    lo.ToPtr(exporters.GeometryTypePoint),
			expected: lo.ToPtr(GeometryTypePoint),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypeMultiPoint),
			expected: lo.ToPtr(GeometryTypeMultiPoint),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypeLineString),
			expected: lo.ToPtr(GeometryTypeLineString),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypeMultiLineString),
			expected: lo.ToPtr(GeometryTypeMultiLineString),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypePolygon),
			expected: lo.ToPtr(GeometryTypePolygon),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypeMultiPolygon),
			expected: lo.ToPtr(GeometryTypeMultiPolygon),
		},
		{
			input:    lo.ToPtr(exporters.GeometryTypeGeometryCollection),
			expected: lo.ToPtr(GeometryTypeGeometryCollection),
		},
		{
			input:    nil,
			expected: nil,
		},
	}

	for _, tt := range tests {
		result := toGeometryType(tt.input)
		assert.Equal(t, tt.expected, result, "For input %v, expected %v but got %v", tt.input, tt.expected, result)
	}
}

func TestFeatureCollectionFromItems(t *testing.T) {
	iid := id.NewItemID()
	sid := id.NewSchemaID()
	mid := id.NewModelID()
	tid := id.NewThreadID()
	pid := id.NewProjectID()
	gst := schema.GeometryObjectSupportedTypeList{schema.GeometryObjectSupportedTypePoint, schema.GeometryObjectSupportedTypeLineString}
	sf1 := schema.NewField(schema.NewGeometryObject(gst).TypeProperty()).NewID().Name("geo1").Key(id.RandomKey()).MustBuild()

	s1 := schema.New().ID(sid).Fields([]*schema.Field{sf1}).Workspace(accountdomain.NewWorkspaceID()).Project(pid).MustBuild()
	str := "{\"coordinates\":[139.28179282584915,36.58570985749664],\"type\":\"Point\"}"
	fi1 := item.NewField(sf1.ID(), value.TypeGeometryObject.Value(str).AsMultiple(), nil)

	i1 := item.New().
		ID(iid).
		Schema(sid).
		Project(pid).
		Fields([]*item.Field{fi1}).
		Model(mid).
		Thread(tid).
		MustBuild()
	v1 := version.New()
	vi1 := version.MustBeValue(v1, nil, version.NewRefs(version.Latest), util.Now(), i1)
	// with geometry fields
	ver1 := item.VersionedList{vi1}

	tests := []struct {
		name        string
		inputVer    item.VersionedList
		inputSchema *schema.Schema
		expected    *FeatureCollection
		expectError bool
	}{
		{
			name:        "Valid input",
			inputVer:    ver1,
			inputSchema: s1,
			expected: &FeatureCollection{
				Features: &[]Feature{
					{
						Id: &iid,
						Geometry: &Geometry{
							Coordinates: &Geometry_Coordinates{
								union: json.RawMessage([]byte("[139.28179282584915,36.58570985749664]")),
							},
							Type: lo.ToPtr(GeometryTypePoint),
						},
						Properties: &map[string]interface{}{},
						Type:       lo.ToPtr(FeatureTypeFeature),
					},
				},
				Type: lo.ToPtr(FeatureCollectionTypeFeatureCollection),
			},
			expectError: false,
		},
		{
			name:        "Invalid input - nil schema",
			inputVer:    item.VersionedList{},
			inputSchema: nil,
			expectError: true,
		},
		{
			name:        "Invalid input - empty VersionedList",
			inputVer:    item.VersionedList{},
			inputSchema: &schema.Schema{},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := FeatureCollectionFromItems(tt.inputVer, tt.inputSchema)
			assert.Equal(t, tt.expected, result, "FeatureCollectionFromItems() expected %v but got %v", tt.expected, result)
			if (err != nil) == tt.expectError {
				fmt.Printf("Error is not matched")
			}
		})
	}
}
