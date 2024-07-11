package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometryObject(t *testing.T) {
	expected1 := &FieldGeometryObject{
		st: GeometryObjectSupportedTypeList{"POINT"},
	}
	res1 := NewGeometryObject(GeometryObjectSupportedTypeList{"POINT"})
	assert.Equal(t, expected1, res1)

	expected2 := &FieldGeometryObject{
		st: GeometryObjectSupportedTypeList{"POINT"},
	}
	res2 := NewGeometryObject(GeometryObjectSupportedTypeList{"POINT", "POINT"})
	assert.Equal(t, expected2, res2)
}

func TestFieldGeometryObject_Type(t *testing.T) {
	assert.Equal(t, value.TypeGeometryObject, (&FieldGeometryObject{}).Type())
}

func TestFieldGeometryObject_TypeProperty(t *testing.T) {
	f := FieldGeometryObject{}
	assert.Equal(t, &TypeProperty{
		t:              f.Type(),
		geometryObject: &f,
	}, (&f).TypeProperty())
}
func TestFieldGeometryObject_Clone(t *testing.T) {
	assert.Nil(t, (*FieldGeometryObject)(nil).Clone())
	assert.Equal(t, &FieldGeometryObject{}, (&FieldGeometryObject{}).Clone())
}

func TestFieldGeometryObject_Validate(t *testing.T) {
	supportedType := GeometryObjectSupportedTypePoint
	geojson := `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`
	assert.NoError(t, (&FieldGeometryObject{st: GeometryObjectSupportedTypeList{supportedType}}).Validate(value.TypeGeometryObject.Value(geojson)))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryObject{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryObject{}).Validate(value.TypeText.Value(float64(1))))
}

func TestIsValidGeometryObjectField(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name: "valid GeoJSON feature",
			input: `{
				"type": "Feature",
				"geometryObject": {
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
			name: "valid GeoJSON geometry",
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
