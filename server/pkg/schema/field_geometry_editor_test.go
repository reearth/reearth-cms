package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometryEditor(t *testing.T) {
	expected1 := &FieldGeometryEditor{
		st: GeometryEditorSupportedTypeList{"POINT"},
	}
	res1 := NewGeometryEditor(GeometryEditorSupportedTypeList{"POINT"})
	assert.Equal(t, expected1, res1)

	expected2 := &FieldGeometryEditor{
		st: GeometryEditorSupportedTypeList{"POINT"},
	}
	res2 := NewGeometryEditor(GeometryEditorSupportedTypeList{"POINT", "POINT"})
	assert.Equal(t, expected2, res2)
}

func TestFieldGeometryEditor_Type(t *testing.T) {
	assert.Equal(t, value.TypeGeometryEditor, (&FieldGeometryEditor{}).Type())
}

func TestFieldGeometryEditor_TypeProperty(t *testing.T) {
	f := FieldGeometryEditor{}
	assert.Equal(t, &TypeProperty{
		t:              f.Type(),
		geometryEditor: &f,
	}, (&f).TypeProperty())
}
func TestFieldGeometryEditor_Clone(t *testing.T) {
	assert.Nil(t, (*FieldGeometryEditor)(nil).Clone())
	assert.Equal(t, &FieldGeometryEditor{}, (&FieldGeometryEditor{}).Clone())
}

func TestFieldGeometryEditor_Validate(t *testing.T) {
	supportedType := GeometryEditorSupportedTypePoint
	geojson := `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`
	assert.NoError(t, (&FieldGeometryEditor{st: GeometryEditorSupportedTypeList{supportedType}}).Validate(value.TypeGeometryEditor.Value(geojson)))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryEditor{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryEditor{}).Validate(value.TypeText.Value(float64(1))))
}

func TestIsValidGeometryEditorField(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name: "valid GeoJSON feature",
			input: `{
				"type": "Feature",
				"geometryEditor": {
					"type": "Point",
					"coordinates": [102.0, 0.5]
				},
				"properties": {
					"prop0": "value0"
				}
			}`,
			expected: true,
		},
		{
			name: "valid GeoJSON geometryEditor",
			input: `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`,
			expected: true,
		},
		{
			name: "invalid GeoJSON type",
			input: `{
				"type": "InvalidType",
				"coordinates": [102.0, 0.5]
			}`,
			expected: false,
		},
		{
			name:     "empty string",
			input:    ``,
			expected: false,
		},
		{
			name:     "random string",
			input:    `random string`,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidGeometryObjectField(tt.input))
		})
	}
}
