package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewPoint(t *testing.T) {
	assert.Equal(t, &FieldPoint{p: &FieldPosition{t: value.TypePoint}}, NewPoint())
}

func TestFieldPoint_Type(t *testing.T) {
	assert.Equal(t, value.TypePoint, (&FieldPoint{p: &FieldPosition{t: value.TypePoint}}).Type())
}

func TestFieldPoint_TypeProperty(t *testing.T) {
	f := FieldPoint{}
	assert.Equal(t, &TypeProperty{
		t:     f.Type(),
		point: &f,
	}, (&f).TypeProperty())
}

func TestFieldPoint_Clone(t *testing.T) {
	assert.Nil(t, (*FieldPoint)(nil).Clone())
	assert.Equal(t, &FieldPoint{}, (&FieldPoint{}).Clone())
}

func TestFieldPoint_Validate(t *testing.T) {
	assert.NoError(t, (&FieldPoint{p: &FieldPosition{t: value.TypePoint}}).Validate(value.TypePoint.Value([]float64{1.12345, 2.12345})))
	assert.Equal(t, ErrInvalidValue, (&FieldPoint{p: &FieldPosition{t: value.TypePoint}}).Validate(value.TypePoint.Value([]float64{1.12345})))
	assert.Equal(t, ErrInvalidValue, (&FieldPoint{p: &FieldPosition{t: value.TypePoint}}).Validate(value.TypePoint.Value("")))
}
