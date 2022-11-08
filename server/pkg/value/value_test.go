package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNew(t *testing.T) {
	v, err := New(TypeText, "aaa")
	assert.NoError(t, err)
	assert.Equal(t, &Value{t: TypeText, v: "aaa"}, v)

	v, err = New(TypeText, nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestNewOptional(t *testing.T) {
	v, err := NewOptional(TypeText, "aaa")
	assert.NoError(t, err)
	assert.Equal(t, &Value{t: TypeText, v: "aaa"}, v)

	v, err = NewOptional(TypeText, nil)
	assert.NoError(t, err)
	assert.Equal(t, &Value{t: TypeText, v: nil}, v)

	v, err = NewOptional(TypeText, true)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)

	v, err = NewOptional(TypeUnknown, "aaa")
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}
