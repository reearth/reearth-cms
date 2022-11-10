package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldBool(t *testing.T) {
	b := NewFieldBool()
	assert.Equal(t, &FieldBool{}, b)
}

func TestFieldBool_TypeProperty(t *testing.T) {
	tp := (&FieldBool{}).TypeProperty()
	assert.Equal(t, &TypeProperty{bool: &FieldBool{}}, tp)
}

func TestFieldBool_Validate(t *testing.T) {
	assert.Same(t, ErrInvalidValue, (&FieldBool{}).Validate(&value.Value{}))
	assert.Nil(t, (&FieldBool{}).Validate(value.Must(value.TypeBool, true)))
}
