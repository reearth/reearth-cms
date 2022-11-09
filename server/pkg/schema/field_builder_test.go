package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_NewField(t *testing.T) {
	fb := NewField(&TypeProperty{})
	assert.Equal(t, &FieldBuilder{f: &Field{typeProperty: &TypeProperty{}}}, fb)
}

/*
func TestFieldBuilder_Build(t *testing.T) {
	// fid := NewFieldID()
	f, err := (&FieldBuilder{}).Build()
	assert.Equal(t, nil, f)
	assert.ErrorIs(t, err, ErrInvalidID)
}
*/
