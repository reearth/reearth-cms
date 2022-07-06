package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/stretchr/testify/assert"
)

func TestAsset_AssetType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
	afid := NewAssetFileID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	var size uint64 = 15
	got := Asset{
		id:        aid,
		projectID: pid,
		createdBy: uid,
		createdAt: tim,
		fileName:  "hoge",
		assetType: "xxx",
		size:      size,
		files:     id.AssetFileIDList{afid},
	}
	assert.Equal(t, aid, got.ID())
	assert.Equal(t, pid, got.Project())
	assert.Equal(t, uid, got.CreatedBy())
	assert.Equal(t, tim, got.CreatedAt())
	assert.Equal(t, "hoge", got.FileName())
	assert.Equal(t, "xxx", got.AssetType())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, id.AssetFileIDList{afid}, got.Files())
}

func TestAsset_AddFiles(t *testing.T) {
	afid := NewAssetFileID()
	tests := []struct {
		name            string
		asset           *Asset
		expected, files id.AssetFileIDList
	}{
		{
			name: "should add one file",
			asset: &Asset{
				id:    NewID(),
				files: id.AssetFileIDList{},
			},
			files:    id.AssetFileIDList{afid},
			expected: id.AssetFileIDList{afid},
		}, {
			name:     "nil asset, should add nothing",
			files:    id.AssetFileIDList{afid},
			expected: nil,
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.asset.AddFiles(tc.files...)
			assert.Equal(t, tc.expected, tc.asset.Files())
		})
	}
}
