package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewNumber(t *testing.T) {
	got, err := NewNumber(new(float64(1)), new(float64(2)))
	assert.Equal(t, &FieldNumber{
		min: new(float64(1)),
		max: new(float64(2)),
	}, got)
	assert.NoError(t, err)
	got, err = NewNumber(new(float64(3)), new(float64(2)))
	assert.Nil(t, got)
	assert.Equal(t, ErrInvalidMinMax, err)
}

func TestFieldNumber_Type(t *testing.T) {
	assert.Equal(t, value.TypeNumber, (&FieldNumber{}).Type())
}

func TestFieldNumber_TypeProperty(t *testing.T) {
	f := FieldNumber{}
	assert.Equal(t, &TypeProperty{
		t:      f.Type(),
		number: &f,
	}, (&f).TypeProperty())
}

func TestFieldNumber_Clone(t *testing.T) {
	assert.Nil(t, (*FieldNumber)(nil).Clone())
	assert.Equal(t, &FieldNumber{
		min: new(float64(1)),
		max: new(float64(2)),
	}, (&FieldNumber{
		min: new(float64(1)),
		max: new(float64(2)),
	}).Clone())
}

func TestFieldNumber_Validate(t *testing.T) {
	assert.NoError(t, (&FieldNumber{}).Validate(value.TypeNumber.Value(1)))
	assert.ErrorContains(t,
		(&FieldNumber{min: new(float64(1.1))}).Validate(value.TypeNumber.Value(1.01)),
		"value should be larger than 1.100000")
	assert.ErrorContains(t,
		(&FieldNumber{max: new(float64(1.1))}).Validate(value.TypeNumber.Value(1.11)),
		"value should be smaller than 1.100000")
	assert.Equal(t, ErrInvalidValue, (&FieldNumber{}).Validate(value.TypeText.Value("")))
}
