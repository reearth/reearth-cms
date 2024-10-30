package token

import (
	"crypto/rand"
	"math/big"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrTokenLength  = rerror.NewE(i18n.T("token length must be positive"))
	ErrEmptyCharset = rerror.NewE(i18n.T("charset cannot be empty"))
)

type Token struct {
	prefix  string
	length  int
	charset string
	value   string
}

func New(prefix *string, length *int, charset *string) *Token {
	tk := &Token{
		prefix:  "secret_",
		length:  43,
		charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	}

	if prefix != nil && *prefix != "" {
		tk.prefix = *prefix
	}
	if length != nil && *length > 0 {
		tk.length = *length
	}
	if charset != nil && len(*charset) > 0 {
		tk.charset = *charset
	}
	v, _ := tk.generate()
	tk.value = v

	return tk
}

func (r *Token) Prefix() string {
	return r.prefix
}

func (r *Token) Length() int {
	return r.length
}

func (r *Token) Charset() string {
	return r.charset
}

func (r *Token) Value() string {
	return r.value
}

func (r *Token) SetPrefix(p string) {
	r.prefix = p
}

func (r *Token) SetLength(l int) error {
	if l <= 0 {
		return ErrTokenLength
	}
	r.length = l
	return nil
}

func (r *Token) SetCharset(c string) error {
	if len(c) == 0 {
		return ErrEmptyCharset
	}
	r.charset = c
	return nil
}

func (t *Token) generate() (string, error) {
	if t.length <= 0 {
		return "", ErrTokenLength
	}
	if len(t.charset) == 0 {
		return "", ErrEmptyCharset
	}

	result := make([]byte, t.length)
	for i := 0; i < t.length; i++ {
		randIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(t.charset))))
		if err != nil {
			return "", err
		}
		result[i] = t.charset[randIndex.Int64()]
	}

	return t.prefix + string(result), nil
}
