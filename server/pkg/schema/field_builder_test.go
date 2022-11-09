package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_NewField(t *testing.T) {
	fb := NewField(&TypeProperty{})
	assert.Equal(t, &FieldBuilder{f: &Field{typeProperty: &TypeProperty{}}}, fb)
}

func TestFieldBuilder_Build(t *testing.T) {
	fid := NewFieldID()
	f, err := (&FieldBuilder{&Field{id: fid}, error}).Build()
	assert.Equal(t, (&FieldBuilder{}).f, f)
	assert.Nil(t, err)
}
