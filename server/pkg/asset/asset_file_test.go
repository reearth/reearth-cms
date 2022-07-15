package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestAssetFile_AssetFileType(t *testing.T) {
	uid := NewUserID()
	aid := NewID()
	afid := NewAssetFileID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	got := AssetFile{
		id:          afid,
		assetID:     aid,
		name:        "hoge",
		size:        size,
		contentType: "xxx",
		uploadedAt:  tim,
		uploadedBy:  uid,
	}
	assert.Equal(t, afid, got.ID())
	assert.Equal(t, aid, got.Asset())
	assert.Equal(t, uid, got.UploadedBy())
	assert.Equal(t, tim, got.UploadedAt())
	assert.Equal(t, "hoge", got.Name())
	assert.Equal(t, "xxx", got.ContentType())
	assert.Equal(t, size, got.Size())
}

func TestAssetFile_Children(t *testing.T) {
	// nil file should return nil children
	var got AssetFile
	assert.Nil(t, got.Children())

	// file.Children() should return file.children
	afid := NewAssetFileID()
	got = AssetFile{
		id:          afid,
		children:    id.AssetFileIDList{afid},
	}
	assert.Equal(t, id.AssetFileIDList{afid}, got.Children())
}

func TestAssetFile_AddChildren(t *testing.T) {
	afid := NewAssetFileID()
	tests := []struct {
		name               string
		file               *AssetFile
		expected, children id.AssetFileIDList
	}{
		{
			name: "should add one child",
			file: &AssetFile{
				id:       NewAssetFileID(),
				children: id.AssetFileIDList{},
			},
			children: id.AssetFileIDList{afid},
			expected: id.AssetFileIDList{afid},
		}, {
			name:     "nil asset file, should add nothing",
			children: id.AssetFileIDList{afid},
			expected: nil,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.file.AddChildren(tc.children...)
			assert.Equal(t, tc.expected, tc.file.Children())
		})
	}
}
