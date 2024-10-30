package token

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestToken_Generate(t *testing.T) {
	tk := &Token{
		prefix:  "test_",
		length:  10,
		charset: "abcdefghijklmnopqrstuvwxyz",
	}
	generatedToken, err := tk.Generate()
	assert.NoError(t, err)
	assert.Equal(t, tk.prefix, generatedToken.String()[:len(tk.prefix)])
	assert.Equal(t, 10+len(tk.prefix), len(generatedToken.String()))

  // invalid length
	tk = &Token{
		length:  -1, 
		charset: "abc",
	}
	_, err = tk.Generate()
	assert.ErrorIs(t, err, ErrTokenLength)

	// empty charset
	tk = &Token{
		length:  5,
		charset: "", 
	}
	_, err = tk.Generate()
	assert.ErrorIs(t, err, ErrEmptyCharset)
}

func TestToken_String(t *testing.T) {
	tk := &Token{
		prefix:  "example_",
		value:   "example_123456",
	}

	assert.Equal(t, "example_123456", tk.String())
}
