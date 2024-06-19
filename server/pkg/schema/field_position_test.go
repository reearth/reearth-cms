package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewPosition(t *testing.T) {
	assert.Equal(t, &FieldPosition{t: value.TypePoint}, NewPosition(value.TypePoint))
}

func TestFieldPosition_Type(t *testing.T) {
	assert.Equal(t, value.TypePoint, (&FieldPosition{t: value.TypePoint}).Type())
}

func TestFieldPosition_Clone(t *testing.T) {
	assert.Nil(t, (*FieldPosition)(nil).Clone())
	assert.Equal(t, &FieldPosition{t: value.TypePoint}, (&FieldPosition{t: value.TypePoint}).Clone())
}

func TestFieldPosition_Validate(t *testing.T) {
	assert.NoError(t, (&FieldPosition{t: value.TypePoint}).Validate(value.TypePoint.Value([]float64{1.12345, 2.12345})))
	assert.Equal(t, ErrInvalidValue, (&FieldPosition{t: value.TypePoint}).Validate(value.TypeNumber.Value([]float64{1.12345})))
	assert.Equal(t, ErrInvalidValue, (&FieldPosition{t: value.TypePoint}).Validate(value.TypeNumber.Value(1)))
}
