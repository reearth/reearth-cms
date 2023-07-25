package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewReference(t *testing.T) {
	m := id.NewModelID()
	assert.Equal(t, &FieldReference{modelID: m, correspondingField: nil}, NewReference(m, nil))
}

func TestFieldReference_CorrespondingField(t *testing.T) {
	r := &FieldReference{modelID: id.NewModelID(), correspondingField: nil}
	assert.Equal(t, r.correspondingField, r.CorrespondingField())
}

func TestFieldReference_Type(t *testing.T) {
	assert.Equal(t, value.TypeReference, (&FieldReference{}).Type())
}

func TestFieldReference_TypeProperty(t *testing.T) {
	f := FieldReference{}
	assert.Equal(t, &TypeProperty{
		t:         f.Type(),
		reference: &f,
	}, (&f).TypeProperty())
}

func TestFieldReference_Clone(t *testing.T) {
	m := id.NewModelID()
	assert.Nil(t, (*FieldReference)(nil).Clone())
	assert.Equal(t, &FieldReference{modelID: m, correspondingField: nil}, (&FieldReference{modelID: m, correspondingField: nil}).Clone())
}

func TestFieldReference_Validate(t *testing.T) {
	aid := id.NewItemID()
	assert.NoError(t, (&FieldReference{}).Validate(value.TypeReference.Value(aid)))
	assert.Equal(t, ErrInvalidValue, (&FieldReference{}).Validate(value.TypeText.Value("")))
}
