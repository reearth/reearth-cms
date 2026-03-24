package schema

import (
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldFrom(t *testing.T) {
	tests := []struct {
		name  string
		key   string
		value any
		want  GuessFieldData
	}{
		{
			name:  "string input",
			key:   "name",
			value: "hello",
			want: GuessFieldData{
				Type: value.TypeText,
				Name: "name",
				Key:  "name",
			},
		},
		{
			name:  "bool input",
			key:   "active",
			value: true,
			want: GuessFieldData{
				Type: value.TypeBool,
				Name: "active",
				Key:  "active",
			},
		},
		{
			name:  "int input",
			key:   "age",
			value: 42,
			want: GuessFieldData{
				Type: value.TypeNumber,
				Name: "age",
				Key:  "age",
			},
		},
		{
			name:  "float input",
			key:   "height",
			value: 3.14,
			want: GuessFieldData{
				Type: value.TypeNumber,
				Name: "height",
				Key:  "height",
			},
		},
		{
			name:  "nil value",
			key:   "empty",
			value: nil,
			want: GuessFieldData{
				Type: value.TypeText,
				Name: "empty",
				Key:  "empty",
			},
		},
		{
			name:  "unsupported type (map)",
			key:   "meta",
			value: map[string]string{"k": "v"},
			want: GuessFieldData{
				Type: value.TypeText,
				Name: "meta",
				Key:  "meta",
			},
		},
		{
			name:  "unsupported type (slice)",
			key:   "arr",
			value: []string{"v1", "v2"},
			want: GuessFieldData{
				Type: value.TypeText,
				Name: "arr",
				Key:  "arr",
			},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := fieldFrom(tt.key, tt.value)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestIsAssignable(t *testing.T) {
	tests := []struct {
		name      string
		valueType value.Type
		fieldType value.Type
		want      bool
	}{
		{
			name:      "text value to text field",
			valueType: value.TypeText,
			fieldType: value.TypeText,
			want:      true,
		},
		{
			name:      "text value to number field",
			valueType: value.TypeText,
			fieldType: value.TypeNumber,
			want:      false,
		},
		{
			name:      "number value to text field",
			valueType: value.TypeNumber,
			fieldType: value.TypeText,
			want:      true,
		},
		{
			name:      "integer value to number field",
			valueType: value.TypeInteger,
			fieldType: value.TypeNumber,
			want:      true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got := isAssignable(tt.valueType, tt.fieldType)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestSchema_GuessSchemaFieldFromJson(t *testing.T) {
	tests := []struct {
		name      string
		schema    *Schema
		jsonData  string
		isGeoJSON bool
		want      []GuessFieldData
		wantErr   bool
	}{
		{
			name:   "flat JSON with various field types",
			schema: &Schema{},
			jsonData: `[
                {
                    "name": "John Doe",
                    "age": 30,
                    "active": true,
                    "height": 1.85
                }
            ]`,
			isGeoJSON: false,
			want: []GuessFieldData{
				{Type: value.TypeText, Name: "name", Key: "name"},
				{Type: value.TypeInteger, Name: "age", Key: "age"},
				{Type: value.TypeBool, Name: "active", Key: "active"},
				{Type: value.TypeNumber, Name: "height", Key: "height"},
			},
			wantErr: false,
		},
		{
			name:   "flat JSON with invalid geoJson flag",
			schema: &Schema{},
			jsonData: `[
                {
                    "name": "John Doe",
                    "age": 30,
                    "active": true,
                    "height": 1.85
                }
            ]`,
			isGeoJSON: true,
			want:      nil,
			wantErr:   true,
		},
		{
			name:   "GeoJSON with point geometry",
			schema: &Schema{},
			jsonData: `{
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [125.6, 10.1]
                        },
                        "properties": {
                            "name": "Location A",
                            "category": "Park",
                            "visitors": 1500
                        }
                    }
                ]
            }`,
			isGeoJSON: true,
			want: []GuessFieldData{
				{Type: value.TypeGeometryObject, Name: "geometry", Key: "geometry"},
				{Type: value.TypeText, Name: "name", Key: "name"},
				{Type: value.TypeText, Name: "category", Key: "category"},
				{Type: value.TypeInteger, Name: "visitors", Key: "visitors"},
			},
			wantErr: false,
		},
		{
			name:   "GeoJSON with invalid geoJson flag",
			schema: &Schema{},
			jsonData: `{
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [125.6, 10.1]
                        },
                        "properties": {
                            "name": "Location A",
                            "category": "Park",
                            "visitors": 1500
                        }
                    }
                ]
            }`,
			isGeoJSON: false,
			want:      nil,
			wantErr:   true,
		},
		{
			name:      "invalid JSON",
			schema:    &Schema{},
			jsonData:  `{invalid json`,
			isGeoJSON: false,
			want:      nil,
			wantErr:   true,
		},
		{
			name:      "empty JSON array",
			schema:    &Schema{},
			jsonData:  `[]`,
			isGeoJSON: false,
			want:      nil,
			wantErr:   true,
		},
		{
			name:   "invalid GeoJSON (missing features)",
			schema: &Schema{},
			jsonData: `{
                "type": "FeatureCollection"
            }`,
			isGeoJSON: true,
			want:      nil,
			wantErr:   true,
		},
		{
			name:   "invalid GeoJSON (missing properties)",
			schema: &Schema{},
			jsonData: `{
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [125.6, 10.1]
                        }
                    }
                ]
            }`,
			isGeoJSON: true,
			want:      nil,
			wantErr:   true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := tt.schema.GuessSchemaFieldFromJson(strings.NewReader(tt.jsonData), tt.isGeoJSON, true)
			assert.Equal(t, tt.want, got)
			if tt.wantErr {
				assert.Error(t, err)
				return
			}
			assert.NoError(t, err)
		})
	}
}
