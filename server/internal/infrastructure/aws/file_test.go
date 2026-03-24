package aws

import (
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFile_GetS3ObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(s3AssetBasePath, u[:2], u[2:], "xxx.yyy"), getS3ObjectPath(u, n))

	n = "ああああ.yyy"
	assert.Equal(t, path.Join(s3AssetBasePath, u[:2], u[2:], "ああああ.yyy"), getS3ObjectPath(u, n))

	assert.Equal(t, "", getS3ObjectPath("", ""))
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, isValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, isValidUUID(u1))
}
