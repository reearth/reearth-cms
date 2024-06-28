package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewGeometry(t *testing.T) {
	expected := &FieldGeometry{
		st: GeometrySupportedTypeList{"POINT"},
	}
	res := NewGeometry(GeometrySupportedTypeList{"POINT"})
	assert.Equal(t, expected, res)
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
	assert.NoError(t, (&FieldGeometry{st: GeometrySupportedTypeList{supportedType}}).Validate(value.TypeGeometry.Value("{}")))
	assert.Equal(t, ErrInvalidValue, (&FieldGeometry{}).Validate(value.TypeText.Value(float64(1))))
}
