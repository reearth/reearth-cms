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
	cf := id.NewFieldID().Ref()
	sid := id.NewSchemaID().Ref()
	assert.Equal(t, &FieldReference{modelID: m, correspondingSchemaID: sid, correspondingFieldID: cf}, NewReference(m, sid, nil, cf))
}

func TestFieldReference_SetCorrespondingField(t *testing.T) {
	m := id.NewModelID()
	cf := id.NewFieldID().Ref()
	sid := id.NewSchemaID().Ref()
	f := NewReference(m, nil, nil, nil)
	f.SetCorrespondingField(cf)
	assert.Equal(t, &FieldReference{modelID: m, correspondingSchemaID: sid, correspondingFieldID: cf}, NewReference(m, sid, nil, cf))
}

func TestFieldReference_SetCorrespondingSchema(t *testing.T) {
	m := id.NewModelID()
	f := id.NewFieldID()
	sid := id.NewSchemaID()
	cf := &CorrespondingField{
		Title:       lo.ToPtr("title"),
		Key:         lo.ToPtr("key"),
		Description: lo.ToPtr("description"),
		Required:    lo.ToPtr(true),
	}
	fr := NewReference(m, sid.Ref(), cf, f.Ref())
	fr.SetCorrespondingSchema(sid.Ref())
	assert.Equal(t, fr.correspondingSchemaID.Ref(), sid.Ref())
}

func TestFieldReference_CorrespondingField(t *testing.T) {
	m := id.NewModelID()
	cf := &CorrespondingField{}
	sid := id.NewSchemaID().Ref()
	f := NewReference(m, sid, cf, nil)
	assert.Equal(t, cf, f.CorrespondingField())
}

func TestFieldReference_CorrespondingFieldID(t *testing.T) {
	m := id.NewModelID()
	cf := id.NewFieldID().Ref()
	f := NewReference(m, nil, nil, cf)
	assert.Equal(t, cf, f.CorrespondingFieldID())
}

func TestFieldReference_Model(t *testing.T) {
	m := id.NewModelID()
	f := NewReference(m, nil, nil, nil)
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
	cf := id.NewFieldID().Ref()
	assert.Nil(t, (*FieldReference)(nil).Clone())
	assert.Equal(t, &FieldReference{modelID: m, correspondingFieldID: cf}, (&FieldReference{modelID: m, correspondingFieldID: cf}).Clone())
}

func TestFieldReference_Validate(t *testing.T) {
	aid := id.NewItemID()
	assert.NoError(t, (&FieldReference{}).Validate(value.TypeReference.Value(aid)))
	assert.Equal(t, ErrInvalidValue, (&FieldReference{}).Validate(value.TypeText.Value("")))
}
