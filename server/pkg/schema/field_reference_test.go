package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewReference(t *testing.T) {
	m := id.NewModelID()
	cf := lo.ToPtr(id.NewFieldID())
	assert.Equal(t, &FieldReference{modelID: m, correspondingFieldId: cf}, NewReference(m, nil, cf))
}

func TestFieldReference_SetCorrespondingField(t *testing.T) {
	m := id.NewModelID()
	cf := lo.ToPtr(id.NewFieldID())
	f := NewReference(m, nil, nil)
	f.SetCorrespondingField(cf)
	assert.Equal(t, &FieldReference{modelID: m, correspondingFieldId: cf}, NewReference(m, nil, cf))
}

func TestFieldReference_CorrespondingField(t *testing.T) {
	m := id.NewModelID()
	cf := &CorrespondingField{}
	f := NewReference(m, cf, nil)
	assert.Equal(t, cf, f.CorrespondingField())
}

func TestFieldReference_CorrespondingFieldID(t *testing.T) {
	m := id.NewModelID()
	cf := lo.ToPtr(id.NewFieldID())
	f := NewReference(m, nil, cf)
	assert.Equal(t, cf, f.CorrespondingFieldID())
}

func TestFieldReference_Model(t *testing.T) {
	m := id.NewModelID()
	f := NewReference(m, nil, nil)
	assert.Equal(t, m, f.Model())
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
	cf := lo.ToPtr(id.NewFieldID())
	assert.Nil(t, (*FieldReference)(nil).Clone())
	assert.Equal(t, &FieldReference{modelID: m, correspondingFieldId: cf}, (&FieldReference{modelID: m, correspondingFieldId: cf}).Clone())
}

func TestFieldReference_Validate(t *testing.T) {
	aid := id.NewItemID()
	assert.NoError(t, (&FieldReference{}).Validate(value.TypeReference.Value(aid)))
	assert.Equal(t, ErrInvalidValue, (&FieldReference{}).Validate(value.TypeText.Value("")))
}
