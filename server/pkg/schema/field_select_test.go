package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldSelect_NewFieldSelect(t *testing.T) {
	v := []string{"v1"}
	b := NewFieldSelect(v)
	assert.Equal(t, &FieldSelect{values: v}, b)
}

func TestFieldSelect_TypeProperty(t *testing.T) {
	tp := (&FieldSelect{}).TypeProperty()
	assert.Equal(t, &TypeProperty{selectt: &FieldSelect{}}, tp)
}

func TestFieldSelect_Validate(t *testing.T) {
	err := (&FieldSelect{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
