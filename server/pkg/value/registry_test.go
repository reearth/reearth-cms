package value

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_typeRegistry_ToValue(t *testing.T) {
	t.Parallel()

	got, ok := defaultTypes.ToValue(TypeText, "foo")
	assert.Equal(t, "foo", got)
	assert.True(t, ok)

	got, ok = defaultTypes.ToValue(Type("foo"), "foo")
	assert.Nil(t, got)
	assert.False(t, ok)
}

func Test_typeRegistry_ToInterface(t *testing.T) {
	t.Parallel()

	got, ok := defaultTypes.ToInterface(TypeText, "foo")
	assert.Equal(t, "foo", got)
	assert.True(t, ok)

	got, ok = defaultTypes.ToInterface(Type("foo"), "foo")
	assert.Nil(t, got)
	assert.False(t, ok)
}

func Test_typeRegistry_Validate(t *testing.T) {
	t.Parallel()

	valid, ok := defaultTypes.Validate(TypeText, "foo")
	assert.True(t, valid)
	assert.True(t, ok)

	valid, ok = defaultTypes.Validate(TypeText, 1)
	assert.False(t, valid)
	assert.True(t, ok)

	valid, ok = defaultTypes.Validate(Type("foo"), "foo")
	assert.False(t, valid)
	assert.False(t, ok)
}
