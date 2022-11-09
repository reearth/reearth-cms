package schema

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFieldBuilder_NewField(t *testing.T) {
	fb := NewField(&TypeProperty{})
	assert.Equal(t, &FieldBuilder{}, fb)
}

func TestFieldBuilder_Build(t *testing.T) {
	fb, err := (&FieldBuilder{}).Build()
	assert.Equal(t, &FieldBuilder{}, fb)
	assert.Nil(t, nil, err)
}
