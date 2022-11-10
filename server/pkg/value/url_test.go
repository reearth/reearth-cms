package value

import (
	"net/url"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestURL_New(t *testing.T) {
	v, err := (&urlType{}).New("https://example.com")
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", v)

	v, err = (&urlType{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&urlType{}).New(lo.ToPtr("https://example.com"))
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", v)

	v, err = (&urlType{}).New(*lo.Must(url.Parse("https://example.com")))
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", v)

	v, err = (&urlType{}).New((*url.URL)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&urlType{}).New(lo.Must(url.Parse("https://example.com")))
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", v)

	v, err = (&urlType{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestURL_ValueURL(t *testing.T) {
	v := (&Value{t: TypeURL, v: "aaa"}).ValueURL()
	assert.Equal(t, lo.ToPtr("aaa"), v)

	v = (&Value{}).ValueURL()
	assert.Nil(t, v)
}
