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
	ErrEmptyValue   = rerror.NewE(i18n.T("value cannot be empty"))
)

type Token struct {
	prefix  string
	length  int
	charset string
	value   string
}

func (t *Token) Generate() (*Token, error) {
	if t.length <= 0 {
		return nil, ErrTokenLength
	}
	if len(t.charset) == 0 {
		return nil, ErrEmptyCharset
	}

	result := make([]byte, t.length)
	for i := 0; i < t.length; i++ {
		randIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(t.charset))))
		if err != nil {
			return nil, err
		}
		result[i] = t.charset[randIndex.Int64()]
	}

	newToken := &Token{
		prefix:  t.prefix,
		length:  t.length,
		charset: t.charset,
		value:   t.prefix + string(result),
	}

	return newToken, nil
}

func (g *Token) String() string {
	return g.value
}
