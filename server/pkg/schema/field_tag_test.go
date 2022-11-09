package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldTag_NewFieldTag(t *testing.T) {
	v := []string{"v1"}
	b := NewFieldTag(v)
	assert.Equal(t, &FieldTag{values: v}, b)
}

func TestFieldTag_TypeProperty(t *testing.T) {
	tp := (&FieldTag{}).TypeProperty()
	assert.Equal(t, &TypeProperty{tag: &FieldTag{}}, tp)
}

func TestFieldTag_Validate(t *testing.T) {
	err := (&FieldTag{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
