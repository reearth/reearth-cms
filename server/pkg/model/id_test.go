package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIDOrKey(t *testing.T) {
	i := NewID()
	assert.Equal(t, &i, IDOrKey(i.String()).ID())
	assert.Empty(t, IDOrKey(i.String()).Key())
	assert.Nil(t, IDOrKey("aaa").ID())
	assert.Equal(t, new("aaa"), IDOrKey("aaa").Key())
}
