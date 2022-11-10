package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldSelect(t *testing.T) {
	v := []string{"v1"}
	b := NewFieldSelect(v)
	assert.Equal(t, &FieldSelect{values: v}, b)
}

func TestFieldSelect_TypeProperty(t *testing.T) {
	tp := (&FieldSelect{}).TypeProperty()
	assert.Equal(t, &TypeProperty{selectt: &FieldSelect{}}, tp)
}

func TestFieldSelect_Validate(t *testing.T) {
	assert.Same(t, ErrInvalidValue, (&FieldSelect{}).Validate(&value.Value{}))
	assert.Same(t, ErrInvalidValue, (&FieldSelect{values: []string{"a", "b", "c"}}).Validate(value.Must(value.TypeSelect, "aaa")))
	assert.NoError(t, (&FieldSelect{values: []string{"a", "b", "c"}}).Validate(value.Must(value.TypeSelect, "c")))
}
