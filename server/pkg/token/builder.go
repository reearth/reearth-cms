package token

import (
	"github.com/samber/lo"
)

type Builder struct {
	t *Token
}

func New() *Builder {
	return &Builder{
		t: &Token{
			prefix:  "secret_",
			length:  43,
			charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
		},
	}
}

func (b *Builder) Build() (*Token, error) {
	if b.t.length <= 0 {
		return nil, ErrTokenLength
	}
	if len(b.t.charset) == 0 {
		return nil, ErrEmptyCharset
	}
	if b.t.value == "" {
		token, err := b.t.Generate()
		if err != nil {
			return nil, err
		}
		b.t.value = token.String()
	}
	return b.t, nil
}

func (b *Builder) MustBuild() *Token {
	return lo.Must(b.Build())
}

func (b *Builder) Prefix(p string) *Builder {
	b.t.prefix = p
	return b
}

func (b *Builder) Length(l int) *Builder {
	b.t.length = l
	return b
}

func (b *Builder) Charset(c string) *Builder {
	b.t.charset = c
	return b
}

func (b *Builder) GenerateValue() *Builder {
	token, err := b.t.Generate()
	if err == nil {
		b.t.value = token.String()
	}
	return b
}
