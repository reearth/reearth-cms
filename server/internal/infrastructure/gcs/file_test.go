package gcs

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetGCSObjectPath(t *testing.T) {
	u := "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
	n := "xxx.yyy"
	assert.Equal(t, "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/xxx.yyy", getGCSObjectPath(u, n))
}
