package value

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestSelect_New(t *testing.T) {
	v, err := (&selectType{}).New("test")
	assert.NoError(t, err)
	assert.Equal(t, "test", v)

	v, err = (&selectType{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&selectType{}).New(lo.ToPtr("test"))
	assert.NoError(t, err)
	assert.Equal(t, "test", v)

	v, err = (&selectType{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestSelect_ValueSelect(t *testing.T) {
	v := (&Value{t: TypeSelect, v: "a"}).ValueSelect()
	assert.Equal(t, lo.ToPtr("a"), v)

	v = (&Value{}).ValueSelect()
	assert.Nil(t, v)
}
