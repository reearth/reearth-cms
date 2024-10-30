package token

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToken_New(t *testing.T) {
	// default token creation
	tk := New(nil, nil, nil)
	assert.Equal(t, "secret_", tk.Prefix())
	assert.Equal(t, 43, tk.Length())
	assert.Equal(t, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", tk.Charset())
	assert.Equal(t, 43+len(tk.Prefix()), len(tk.Value()))

	// custom prefix
	prefix := "custom_"
	tk = New(&prefix, nil, nil)
	assert.Equal(t, "custom_", tk.Prefix())
	assert.Equal(t, 43+len(prefix), len(tk.Value()))

	// custom length
	length := 10
	tk = New(nil, &length, nil)
	assert.Equal(t, 10, tk.Length())
	assert.Equal(t, 10+len(tk.Prefix()), len(tk.Value()))

	// custom charset
	charset := "abc"
	tk = New(nil, nil, &charset)
	assert.Equal(t, "abc", tk.Charset())

	// invalid length
	invalidLength := -1
	tk = New(nil, &invalidLength, nil)
	assert.Equal(t, tk.length, 43)

	// empty prefix
	emptyPrefix := ""
	tk = New(&emptyPrefix, nil, nil)
	assert.Equal(t, tk.prefix, "secret_")

	// empty charset
	emptyCharset := ""
	tk = New(nil, nil, &emptyCharset)
	assert.Equal(t, tk.charset, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
}

func TestToken_Setters(t *testing.T) {
	tk := &Token{
		prefix:  "initial_",
		length:  5,
		charset: "abc",
	}

	// set prefix
	tk.SetPrefix("newPrefix_")
	assert.Equal(t, "newPrefix_", tk.Prefix())

	// set length
	err := tk.SetLength(-1)
	assert.Equal(t, 5, tk.Length())
	assert.ErrorIs(t, err, ErrTokenLength)
	err = tk.SetLength(15)
	assert.Equal(t, 15, tk.Length())
	assert.Nil(t, err)

	// set charset
	err = tk.SetCharset("")
	assert.Equal(t, "abc", tk.Charset())
	assert.ErrorIs(t, err, ErrEmptyCharset)
	err = tk.SetCharset("xyz")
	assert.Equal(t, "xyz", tk.Charset())
	assert.Nil(t, err)
}

func TestToken_Value(t *testing.T) {
	tk := &Token{
		prefix: "example_",
		value:  "example_123456",
	}
	assert.Equal(t, "example_123456", tk.Value())
}
