package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewKey(t *testing.T) {
	assert.Equal(t, Key{key: "aaaaaaa"}, NewKey("aaaaaaa"))
	assert.Equal(t, Key{}, NewKey("aaaa"))
}

func TestRandomKey(t *testing.T) {
	assert.Equal(t, Key{key: "aaaaaaa"}, RandomKey())
}

func TestKey_IsValid(t *testing.T) {
	assert.True(t, Key{key: "aaa"}.IsValid())
	assert.False(t, Key{}.IsValid())
}

func TestKey_String(t *testing.T) {
	assert.Equal(t, "aaaaaa", Key{key: "aaaaaa"}.String())
	assert.Equal(t, "aaa", Key{key: "aaa"}.String())
}
