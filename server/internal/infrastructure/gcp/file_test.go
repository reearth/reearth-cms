package gcp

import (
	"net/url"
	"path"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestFile_GetURL(t *testing.T) {
	bucketname := "asset.cms.test"
	host := "localhost:8080"
	r, err := NewFile(bucketname, "", "", host)
	assert.NoError(t, err)

	u := newUUID()
	n := "xxx.yyy"
	a := asset.New().NewID().Project(id.NewProjectID()).CreatedByUser(id.NewUserID()).Size(1000).FileName(n).UUID(u).Thread(id.NewThreadID()).MustBuild()

	expected, err := url.JoinPath(host, gcsAssetBasePath, u[:2], u[2:], encodeFileName(n))
	assert.NoError(t, err)
	actual := r.GetURL(a)
	assert.Equal(t, expected, actual)

	u2 := newUUID()
	n2 := "他他他.jpg"
	a2 := asset.New().NewID().Project(id.NewProjectID()).CreatedByUser(id.NewUserID()).Size(1000).FileName(n2).UUID(u2).Thread(id.NewThreadID()).MustBuild()

	expected, err = url.JoinPath(host, gcsAssetBasePath, u2[:2], u2[2:], "%E4%BB%96%E4%BB%96%E4%BB%96.jpg")
	assert.NoError(t, err)
	actual = r.GetURL(a2)
	assert.Equal(t, expected, actual)
}

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "xxx.yyy"), getGCSObjectPath(u, n))

	n = "ああああ.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "ああああ.yyy"), getGCSObjectPath(u, n))

	assert.Equal(t, "", getGCSObjectPath("", ""))
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, IsValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, IsValidUUID(u1))
}

func TestEncodeFileName(t *testing.T) {
	assert.Equal(t, "xxx.yyy", encodeFileName("xxx.yyy"))
	assert.Equal(t, "%E4%BB%96%E4%BB%96%E4%BB%96.jpg", encodeFileName("他他他.jpg"))
}
