package id

import (
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestNewKey(t *testing.T) {
	assert.Equal(t, Key{key: "aaaaaaa"}, NewKey("aaaaaaa"))
	assert.Equal(t, Key{key: "aaaa"}, NewKey("aaaa"))
	assert.Equal(t, Key{key: "aaa!@#"}, NewKey("aaa!@#"))
	assert.Equal(t, Key{key: "テスト"}, NewKey("テスト"))
}

func TestRandomKey(t *testing.T) {
	k := RandomKey()
	assert.NotEmpty(t, k.String())
	assert.True(t, k.IsValid())
}

func TestKey_IsValid(t *testing.T) {
	assert.True(t, Key{key: "aaa"}.IsValid())
	assert.False(t, Key{}.IsValid())
	assert.False(t, Key{key: "id"}.IsValid())
}

func TestKey_IsURLCompatible(t *testing.T) {
	assert.True(t, Key{key: "aaa"}.IsURLCompatible())
	assert.False(t, Key{}.IsURLCompatible())
	assert.False(t, Key{key: "id"}.IsURLCompatible())
	assert.False(t, Key{key: "#aaa"}.IsURLCompatible())
	assert.False(t, Key{key: "a b"}.IsURLCompatible())
}

func TestKey_Ref(t *testing.T) {
	assert.Equal(t, lo.ToPtr(Key{key: "aaa"}), Key{key: "aaa"}.Ref())
}

func TestKey_String(t *testing.T) {
	assert.Equal(t, "aaaaaa", Key{key: "aaaaaa"}.String())
	assert.Equal(t, "aaa", Key{key: "aaa"}.String())
}

func TestKey_StringRef(t *testing.T) {
	assert.Equal(t, lo.ToPtr("aaaaaa"), (&Key{key: "aaaaaa"}).StringRef())
	assert.Equal(t, lo.ToPtr("aaa"), (&Key{key: "aaa"}).StringRef())
	assert.Nil(t, (*Key)(nil).StringRef())
}

func TestKey_NewKeyFromPtr(t *testing.T) {

	str := "test-key"
	wantKey := Key{
		key: lo.FromPtr(&str),
	}
	result := NewKeyFromPtr(&str)
	assert.NotNil(t, result, "Result should not be nil")
	assert.Equal(t, &wantKey, result, "Key value should match the input string")
}
