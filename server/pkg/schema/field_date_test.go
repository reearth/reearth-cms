package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldDate_NewFieldDate(t *testing.T) {
	b := NewFieldDate()
	assert.Equal(t, &FieldDate{}, b)
}

func TestFieldDate_TypeProperty(t *testing.T) {
	tp := (&FieldDate{}).TypeProperty()
	assert.Equal(t, &TypeProperty{date: &FieldDate{}}, tp)
}

func TestFieldDate_Validate(t *testing.T) {
	err := (&FieldDate{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
