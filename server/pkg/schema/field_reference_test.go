package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewFieldReference(t *testing.T) {
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
	assert.Same(t, ErrInvalidValue, (&FieldReference{}).Validate(&value.Value{}))
	assert.NoError(t, (&FieldReference{}).Validate(value.Must(value.TypeReference, id.MustItemID("01ghgg0h5j8bcccd5xmak7sces"))))
}
