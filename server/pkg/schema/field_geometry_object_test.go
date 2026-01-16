package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestGeometryObjectSupportedTypeList_First(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     GeometryObjectSupportedTypeList
		expected GeometryObjectSupportedType
	}{
		{
			name:     "empty list returns empty type",
			list:     GeometryObjectSupportedTypeList{},
			expected: GeometryObjectSupportedType(""),
		},
		{
			name:     "single element returns that element",
			list:     GeometryObjectSupportedTypeList{GeometryObjectSupportedTypePoint},
			expected: GeometryObjectSupportedTypePoint,
		},
		{
			name:     "multiple elements returns first element",
			list:     GeometryObjectSupportedTypeList{GeometryObjectSupportedTypePolygon, GeometryObjectSupportedTypeLineString, GeometryObjectSupportedTypePoint},
			expected: GeometryObjectSupportedTypePolygon,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.list.First())
		})
	}
}

func TestGeometryObjectSupportedTypeList_Strings(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     GeometryObjectSupportedTypeList
		expected []string
	}{
		{
			name:     "empty list returns empty slice",
			list:     GeometryObjectSupportedTypeList{},
			expected: []string{},
		},
		{
			name:     "single element",
			list:     GeometryObjectSupportedTypeList{GeometryObjectSupportedTypePoint},
			expected: []string{"POINT"},
		},
		{
			name:     "multiple elements",
			list:     GeometryObjectSupportedTypeList{GeometryObjectSupportedTypePoint, GeometryObjectSupportedTypeLineString, GeometryObjectSupportedTypePolygon},
			expected: []string{"POINT", "LINESTRING", "POLYGON"},
		},
		{
			name:     "all geometry types",
			list:     GeometryObjectSupportedTypeList{GeometryObjectSupportedTypeMultiPoint, GeometryObjectSupportedTypeMultiLineString, GeometryObjectSupportedTypeMultiPolygon, GeometryObjectSupportedTypeGeometryCollection},
			expected: []string{"MULTIPOINT", "MULTILINESTRING", "MULTIPOLYGON", "GEOMETRYCOLLECTION"},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, tt.list.Strings())
		})
	}
}

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
	geojson2 := `{
					"type": "LineString",
					"coordinates": [
	         [
	           114.70437290715995,
	           -0.49283758513797693
	         ],
	         [
	           117.94574361321565,
	           1.6624101817629793
	         ],
	         [
	           122.18758253669148,
	           3.1330366417804214
	         ]
	       ]
				}`
	assert.NoError(t, (&FieldGeometryObject{st: GeometryObjectSupportedTypeList{supportedType}}).Validate(value.TypeGeometryObject.Value(geojson)))
	assert.Equal(t, (&FieldGeometryObject{st: GeometryObjectSupportedTypeList{supportedType}}).Validate(value.TypeGeometryObject.Value(geojson2)), ErrUnsupportedType)
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryObject{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryObject{}).Validate(value.TypeText.Value(float64(1))))
}
