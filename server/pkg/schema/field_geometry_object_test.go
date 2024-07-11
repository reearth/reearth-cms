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
