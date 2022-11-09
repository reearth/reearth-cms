package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldBool_NewFieldBool(t *testing.T) {
	b := NewFieldBool()
	assert.Equal(t, &FieldBool{}, b)
}

func TestFieldBool_TypeProperty(t *testing.T) {
	tp := (&FieldBool{}).TypeProperty()
	assert.Equal(t, &TypeProperty{bool: &FieldBool{}}, tp)
}

func TestFieldBool_Validate(t *testing.T) {
	err := (&FieldBool{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
