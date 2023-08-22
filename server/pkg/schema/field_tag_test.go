package schema

import (
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
)

func TestNewTag(t *testing.T) {
	assert.Equal(t, &FieldTag{values: []string{"a", "b"}, allowMultiple: false}, NewTag([]string{"a", "b", " a", "b"}, false))
}

func TestAllowMultiple(t *testing.T) {
	tag1 := &FieldTag{values: []string{"a", "b"}, allowMultiple: false}
	assert.False(t, tag1.allowMultiple)
	tag2 := &FieldTag{values: []string{"a", "b"}, allowMultiple: true}
	assert.True(t, tag2.allowMultiple)
}

func TestFieldTag_Type(t *testing.T) {
	assert.Equal(t, value.TypeTag, (&FieldTag{}).Type())
}

func TestFieldTag_TypeProperty(t *testing.T) {
	f := FieldTag{}
	assert.Equal(t, &TypeProperty{
		t:   f.Type(),
		tag: &f,
	}, (&f).TypeProperty())
}

func TestFieldTag_Clone(t *testing.T) {
	assert.Nil(t, (*FieldTag)(nil).Clone())
	assert.Equal(t, &FieldTag{}, (&FieldTag{}).Clone())
}

func TestFieldTag_Validate(t *testing.T) {
	assert.NoError(t, (&FieldTag{values: []string{"aaa"}}).Validate(value.TypeTag.Value("aaa")))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{values: []string{"aa"}}).Validate(value.TypeTag.Value("aaa")))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{}).Validate(value.TypeText.Value("")))
}
