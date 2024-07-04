package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometry(t *testing.T) {
	expected1 := &FieldGeometry{
		st: GeometrySupportedTypeList{"POINT"},
	}
	res1 := NewGeometry(GeometrySupportedTypeList{"POINT"})
	assert.Equal(t, expected1, res1)

	expected2 := &FieldGeometry{
		st: GeometrySupportedTypeList{"POINT"},
	}
	res2 := NewGeometry(GeometrySupportedTypeList{"POINT", "POINT"})
	assert.Equal(t, expected2, res2)
}

func TestFieldGeometry_Type(t *testing.T) {
	assert.Equal(t, value.TypeGeometry, (&FieldGeometry{}).Type())
}

func TestFieldGeometry_TypeProperty(t *testing.T) {
	f := FieldGeometry{}
	assert.Equal(t, &TypeProperty{
		t:        f.Type(),
		geometry: &f,
	}, (&f).TypeProperty())
}
func TestFieldGeometry_Clone(t *testing.T) {
	assert.Nil(t, (*FieldGeometry)(nil).Clone())
	assert.Equal(t, &FieldGeometry{}, (&FieldGeometry{}).Clone())
}

func TestFieldGeometry_Validate(t *testing.T) {
	supportedType := GeometrySupportedTypePoint
	geojson := `{
				"type": "Point",
				"coordinates": [102.0, 0.5]
			}`
	assert.NoError(t, (&FieldGeometry{st: GeometrySupportedTypeList{supportedType}}).Validate(value.TypeGeometry.Value(geojson)))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometry{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometry{}).Validate(value.TypeText.Value(float64(1))))
}

func TestIsValidGeoJSON(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name: "valid GeoJSON feature",
			input: `{
				"type": "Feature",
				"geometry": {
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
			assert.Equal(t, tt.expected, IsValidGeoJSON(tt.input))
		})
	}
}
