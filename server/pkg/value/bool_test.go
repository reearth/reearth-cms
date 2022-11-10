package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBool_New(t *testing.T) {
	want := true

	v, err := (&boolType{}).New(want)
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&boolType{}).New(&want)
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&boolType{}).New((*bool)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&boolType{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestBool_ValueBool(t *testing.T) {
	want := true
	v := (&Value{t: TypeBool, v: want}).ValueBool()
	assert.Equal(t, &want, v)
}
