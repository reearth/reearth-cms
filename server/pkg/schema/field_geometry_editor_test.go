package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestGeometryEditorSupportedTypeList_First(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     GeometryEditorSupportedTypeList
		expected GeometryEditorSupportedType
	}{
		{
			name:     "empty list returns empty type",
			list:     GeometryEditorSupportedTypeList{},
			expected: GeometryEditorSupportedType(""),
		},
		{
			name:     "single element returns that element",
			list:     GeometryEditorSupportedTypeList{GeometryEditorSupportedTypePoint},
			expected: GeometryEditorSupportedTypePoint,
		},
		{
			name:     "multiple elements returns first element",
			list:     GeometryEditorSupportedTypeList{GeometryEditorSupportedTypeLineString, GeometryEditorSupportedTypePolygon, GeometryEditorSupportedTypePoint},
			expected: GeometryEditorSupportedTypeLineString,
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

func TestGeometryEditorSupportedTypeList_Strings(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		list     GeometryEditorSupportedTypeList
		expected []string
	}{
		{
			name:     "empty list returns empty slice",
			list:     GeometryEditorSupportedTypeList{},
			expected: []string{},
		},
		{
			name:     "single element",
			list:     GeometryEditorSupportedTypeList{GeometryEditorSupportedTypePoint},
			expected: []string{"POINT"},
		},
		{
			name:     "multiple elements",
			list:     GeometryEditorSupportedTypeList{GeometryEditorSupportedTypePoint, GeometryEditorSupportedTypeLineString, GeometryEditorSupportedTypePolygon},
			expected: []string{"POINT", "LINESTRING", "POLYGON"},
		},
		{
			name:     "any type",
			list:     GeometryEditorSupportedTypeList{GeometryEditorSupportedTypeAny},
			expected: []string{"ANY"},
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

func TestFieldGeometryEditorEditor_Validate(t *testing.T) {
	supportedType := GeometryEditorSupportedTypePoint
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
	geojson3 := `{
					"type": "MultiPoint",
					"coordinates": [[102.0, 0.5]]
				}`
	assert.NoError(t, (&FieldGeometryEditor{st: GeometryEditorSupportedTypeList{supportedType}}).Validate(value.TypeGeometryEditor.Value(geojson)))
	assert.Equal(t, (&FieldGeometryEditor{st: GeometryEditorSupportedTypeList{supportedType}}).Validate(value.TypeGeometryEditor.Value(geojson2)), ErrUnsupportedType)
	assert.NoError(t, (&FieldGeometryEditor{st: GeometryEditorSupportedTypeList{GeometryEditorSupportedTypeAny}}).Validate(value.TypeGeometryEditor.Value(geojson2)))
	assert.Equal(t, (&FieldGeometryEditor{st: GeometryEditorSupportedTypeList{GeometryEditorSupportedTypeAny}}).Validate(value.TypeGeometryEditor.Value(geojson3)), ErrUnsupportedType)
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryEditor{}).Validate(value.TypeText.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometryEditor{}).Validate(value.TypeText.Value(float64(1))))
}
