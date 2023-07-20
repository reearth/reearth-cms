package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewReference(t *testing.T) {
	m := id.NewModelID()
	d := ReferenceDirectionOneWay
	assert.Equal(t, &FieldReference{modelID: m, direction: d.ToPtr()}, NewReference(m, d.ToPtr()))
}

func TestFieldReference_Direction(t *testing.T) {
	d := ReferenceDirectionOneWay
	r := &FieldReference{modelID: id.NewModelID(), direction: &d}
	assert.Equal(t, r.direction, d.ToPtr())
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
	d := ReferenceDirectionOneWay
	assert.Nil(t, (*FieldReference)(nil).Clone())
	assert.Equal(t, &FieldReference{modelID: m, direction: d.ToPtr()}, (&FieldReference{modelID: m, direction: d.ToPtr()}).Clone())
}

func TestFieldReference_Validate(t *testing.T) {
	aid := id.NewItemID()
	assert.NoError(t, (&FieldReference{}).Validate(value.TypeReference.Value(aid)))
	assert.Equal(t, ErrInvalidValue, (&FieldReference{}).Validate(value.TypeText.Value("")))
}
