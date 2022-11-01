package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestAsset_Type(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	thid := NewThreadID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	wantPreviewType, _ := PreviewTypeFrom("image")
	gotPreviewType, _ := PreviewTypeFrom(PreviewTypeImage.String())

	got := Asset{
		id:          aid,
		project:     pid,
		createdAt:   tim,
		user:        &uid,
		fileName:    "hoge",
		size:        size,
		previewType: &gotPreviewType,
		file:        &File{name: "hoge.zip", size: size, path: "hoge.zip"},
		uuid:        "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
		thread:      thid,
	}

	assert.Equal(t, aid, got.ID())
	assert.Equal(t, pid, got.Project())
	assert.Equal(t, tim, got.CreatedAt())
	assert.Equal(t, &uid, got.User())
	assert.Equal(t, "hoge", got.FileName())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, &wantPreviewType, got.PreviewType())
	assert.Equal(t, &File{name: "hoge.zip", size: size, path: "hoge.zip"}, got.File())
	assert.Equal(t, "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", got.UUID())
	assert.Equal(t, "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/hoge.zip", got.RootPath())
	assert.Equal(t, thid, got.Thread())
}

func TestAsset_CreatedAt(t *testing.T) {
	// if asset is nil Asset.CreatedAt() should be time.Time{}
	var got *Asset = nil
	assert.Equal(t, time.Time{}, got.CreatedAt())
}

func TestAsset_PreviewType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15

	got := Asset{
		id:        aid,
		project:   pid,
		createdAt: tim,
		user:      &uid,
		fileName:  "hoge",
		size:      size,
		file:      &File{},
		uuid:      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
	}

	assert.Nil(t, got.PreviewType())
}

func TestAsset_UpdatePreviewType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15

	got := Asset{
		id:        aid,
		project:   pid,
		createdAt: tim,
		user:      &uid,
		fileName:  "hoge",
		size:      size,
		file:      &File{},
		uuid:      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
	}

	pt := lo.ToPtr(PreviewTypeImage)
	got.UpdatePreviewType(pt)
	assert.Equal(t, pt, got.PreviewType())
}

func TestAsset_Clone(t *testing.T) {
	pid := NewProjectID()
	uid := NewUserID()
	a := New().NewID().Project(pid).CreatedByUser(uid).Size(1000).Thread(id.NewThreadID()).MustBuild()

	got := a.Clone()
	assert.Equal(t, a, got)
	assert.NotSame(t, a, got)
	assert.Nil(t, (*Asset)(nil).Clone())
}
