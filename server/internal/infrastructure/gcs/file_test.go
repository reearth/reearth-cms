package gcs

import (
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetGCSObjectPath(t *testing.T) {
	n := "xxx.yyy"
	u := "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
	assert.Equal(t, "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy", getGCSObjectPath(n, u))
}

func TestGetGCSObjectURL(t *testing.T) {
	e, _ := url.Parse("https://hoge.com/xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy")
	b, _ := url.Parse("https://hoge.com/")
	assert.Equal(t, e, getGCSObjectURL(b, "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy"))
}

func TestGetGCSObjectNameFromURL(t *testing.T) {
	u, _ := url.Parse("https://hoge.com/xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy")
	b, _ := url.Parse("https://hoge.com")
	b2, _ := url.Parse("https://hoge2.com")
	assert.Equal(t, "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy", getGCSObjectNameFromURL(b, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b2, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(nil, u))
	assert.Equal(t, "", getGCSObjectNameFromURL(b, nil))
}
