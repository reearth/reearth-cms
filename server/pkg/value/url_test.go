package value

import (
	"net/url"
	"testing"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestURL_New(t *testing.T) {
	var want string
	var URL url.URL
	v, err := (&urlType{}).New(want)
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&urlType{}).New((*string)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&urlType{}).New(lo.ToPtr(want))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&urlType{}).New(URL)
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&urlType{}).New((*url.URL)(nil))
	assert.NoError(t, err)
	assert.Nil(t, v)

	v, err = (&urlType{}).New(lo.ToPtr(URL))
	assert.NoError(t, err)
	assert.Equal(t, want, v)

	v, err = (&urlType{}).New(nil)
	assert.Same(t, ErrInvalidValue, err)
	assert.Nil(t, v)
}

func TestURL_ValueURL(t *testing.T) {
	var want string
	v := (&Value{t: TypeURL, v: want}).ValueURL()
	assert.Equal(t, &want, v)
}
