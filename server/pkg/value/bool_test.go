package value

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestBool_New(t *testing.T) {
	v, err := (&boolType{}).New(true)
	assert.NoError(t, err)
	assert.Equal(t, true, v)

	v, err = (&boolType{}).New(lo.ToPtr(true))
	assert.NoError(t, err)
	assert.Equal(t, true, v)

	v, err = (&boolType{}).New((*bool)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&boolType{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestBool_ValueBool(t *testing.T) {
	v := (&Value{t: TypeBool, v: true}).ValueBool()
	assert.Equal(t, lo.ToPtr(true), v)

	v = (&Value{}).ValueBool()
	assert.Nil(t, v)
}
