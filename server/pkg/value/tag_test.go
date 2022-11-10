package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTag_New(t *testing.T) {
	var want []string
	v, err := (&tag{}).New([]string(nil))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	var w string
	v, err = (&tag{}).New((w))
	assert.NoError(t, err)
	assert.Equal(t, []string{""}, v)

	v, err = (&tag{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestTag_Valuetag(t *testing.T) {
	var want []string
	v := (&Value{t: TypeTag, v: want}).ValueTag()
	assert.Equal(t, want, v)
}
