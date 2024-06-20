package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewLineString(t *testing.T) {
	assert.Equal(t, &FieldLineString{}, NewLineString())
}

func TestFieldLineString_Type(t *testing.T) {
	assert.Equal(t, value.TypeLineString, (&FieldLineString{}).Type())
}

func TestFieldLineString_TypeProperty(t *testing.T) {
	f := FieldLineString{}
	assert.Equal(t, &TypeProperty{
		t:          f.Type(),
		lineString: &f,
	}, (&f).TypeProperty())
}

func TestFieldLineString_Clone(t *testing.T) {
	assert.Nil(t, (*FieldLineString)(nil).Clone())
	assert.Equal(t, &FieldLineString{}, (&FieldLineString{}).Clone())
}

func TestFieldLineString_Validate(t *testing.T) {
	assert.NoError(t, (&FieldLineString{}).Validate(value.TypeLineString.Value([][]float64{{1.12345, 2.12345}, {1.12345, 2.12345}})))
	assert.Equal(t, ErrInvalidValue, (&FieldLineString{}).Validate(value.TypeLineString.Value([]float64{1.12345})))
	assert.Equal(t, ErrInvalidValue, (&FieldLineString{}).Validate(value.TypeLineString.Value([][]float64{{1.12345, 2.12345}})))
	assert.Equal(t, ErrInvalidValue, (&FieldLineString{}).Validate(value.TypeLineString.Value("")))
}
