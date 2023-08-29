package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewTag(t *testing.T) {
	expected := &Tag{
		name:  "xyz",
		color: TagColorVolcano,
	}
	res := NewTag("xyz", TagColorVolcano)
	assert.Equal(t, expected.Name(), res.Name())
	assert.Equal(t, expected.Color(), res.Color())
	assert.False(t, res.ID().IsEmpty())
}

func TestNewTagWithID(t *testing.T) {
	tid := NewTagID()
	expected := &Tag{id: tid, name: "xxx", color: TagColorBlue}
	res, err := NewTagWithID(tid, "xxx", TagColorBlue)
	assert.NoError(t, err)
	assert.Equal(t, expected, res)
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
	tag := NewTag("xyz", TagColorVolcano)
	assert.NoError(t, (&FieldTag{tags: TagList{tag}}).Validate(value.TypeTag.Value(tag.ID().String())))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{tags: TagList{tag}}).Validate(value.TypeTag.Value("aaa")))
	assert.Equal(t, ErrInvalidValue, (&FieldTag{}).Validate(value.TypeText.Value("")))
}
