package gcs

import (
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(u[:2], u[2:], "xxx.yyy"), getGCSObjectPath(u, n))

	u1 := ""
	n1 := ""
	assert.Equal(t, "", getGCSObjectPath(u1, n1))
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, IsValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, IsValidUUID(u1))
}
