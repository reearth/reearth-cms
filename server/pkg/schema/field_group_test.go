package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewGroup(t *testing.T) {
	g := id.NewGroupID()
	assert.Equal(t, &FieldGroup{group: g}, NewGroup(g))
}

func TestFieldGroup_Group(t *testing.T) {
	g := id.NewGroupID()
	f := NewGroup(g)
	assert.Equal(t, g, f.Group())
}

func TestFieldGroup_Type(t *testing.T) {
	assert.Equal(t, value.TypeGroup, (&FieldGroup{}).Type())
}

func TestFieldGroup_TypeProperty(t *testing.T) {
	f := FieldGroup{}
	assert.Equal(t, &TypeProperty{
		t:     f.Type(),
		group: &f,
	}, (&f).TypeProperty())
}

func TestFieldGroup_Clone(t *testing.T) {
	g := id.NewGroupID()

	assert.Nil(t, (*FieldGroup)(nil).Clone())
	assert.Equal(t, &FieldGroup{group: g}, (&FieldGroup{group: g}).Clone())
}

func TestFieldGroup_Validate(t *testing.T) {
	fid := id.NewFieldID()
	assert.NoError(t, (&FieldGroup{}).Validate(value.TypeGroup.Value(fid)))
	assert.Equal(t, ErrInvalidValue, (&FieldGroup{}).Validate(value.TypeText.Value("")))
}

func TestFieldGroup_ValidateMultiple(t *testing.T) {
	fid1 := id.NewFieldID()
	fid2 := id.NewFieldID()
	fid3 := id.NewFieldID()
	vm1 := value.NewMultiple(value.TypeGroup, []any{fid1, fid2, fid3})
	vm2 := value.NewMultiple(value.TypeGroup, []any{fid1, fid2, fid2})
	assert.NoError(t, (&FieldGroup{}).ValidateMultiple(vm1))
	assert.Error(t, (&FieldGroup{}).ValidateMultiple(vm2))
}
