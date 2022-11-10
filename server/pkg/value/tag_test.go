package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTag_New(t *testing.T) {
	v, err := (&tag{}).New([]string{"aaa", "aa"})
	assert.NoError(t, err)
	assert.Equal(t, []string{"aaa", "aa"}, v)

	v, err = (&tag{}).New("aa,aaaaa")
	assert.NoError(t, err)
	assert.Equal(t, []string{"aa", "aaaaa"}, v)

	v, err = (&tag{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestTag_ValueTag(t *testing.T) {
	v := (&Value{t: TypeTag, v: []string{"a"}}).ValueTag()
	assert.Equal(t, []string{"a"}, v)

	v = (&Value{}).ValueTag()
	assert.Nil(t, v)
}
