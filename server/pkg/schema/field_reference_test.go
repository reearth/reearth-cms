package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestFieldReference_NewFieldReference(t *testing.T) {
	i := id.NewModelID()
	u := NewFieldReference(i)
	assert.Equal(t, &FieldReference{modelID: i}, u)
}

func TestFieldReference_TypeProperty(t *testing.T) {
	tp := (&FieldReference{}).TypeProperty()
	assert.Equal(t, &TypeProperty{reference: &FieldReference{}}, tp)
}

func TestFieldReference_ModelID(t *testing.T) {
	mid := (&FieldReference{}).ModelID()
	assert.Equal(t, (&FieldReference{}).ModelID(), mid)
}

func TestFieldReference_Validate(t *testing.T) {
	err := (&FieldReference{}).Validate(&value.Value{})
	assert.ErrorIs(t, err, ErrInvalidDefaultValue)
}
