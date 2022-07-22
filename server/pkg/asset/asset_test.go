package asset

import (
	"testing"
	"time"

	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestAsset_AssetType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	wantPreviewType := PreviewTypeFromRef(lo.ToPtr("IMAGE"))

	got := Asset{
		id:          aid,
		project:     pid,
		createdAt:   tim,
		createdBy:   uid,
		fileName:    "hoge",
		size:        size,
		previewType: PreviewTypeFromRef(lo.ToPtr(PreviewTypeIMAGE.String())),
		file:        &File{},
		hash:        "yyy",
	}

	assert.Equal(t, aid, got.ID())
	assert.Equal(t, pid, got.Project())
	assert.Equal(t, tim, got.CreatedAt())
	assert.Equal(t, uid, got.CreatedBy())
	assert.Equal(t, "hoge", got.FileName())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, wantPreviewType, got.PreviewType())
	assert.Equal(t, &File{}, got.File())
	assert.Equal(t, "yyy", got.Hash())
}

func TestAsset_CreatedAt(t *testing.T) {
	// if asset is nil Asset.CreatedAt() should be time.Time{}
	var got *Asset = nil
	assert.Equal(t, time.Time{}, got.CreatedAt())
}
