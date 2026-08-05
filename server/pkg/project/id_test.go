package project

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIDOrAlias(t *testing.T) {
	i := NewID()
	assert.Equal(t, &i, IDOrAlias(i.String()).ID())
	assert.Empty(t, IDOrAlias(i.String()).Alias())
	assert.Nil(t, IDOrAlias("aaa").ID())
	assert.Equal(t, new("aaa"), IDOrAlias("aaa").Alias())
}
