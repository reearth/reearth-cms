package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestAsset_AssetType(t *testing.T) {
	aid := NewID()
	pid := NewProjectID()
	uid := NewUserID()
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
		url:       "yyy",
	}
	assert.Equal(t, aid, got.ID())
	assert.Equal(t, pid, got.Project())
	assert.Equal(t, uid, got.CreatedBy())
	assert.Equal(t, tim, got.CreatedAt())
	assert.Equal(t, "hoge", got.FileName())
	assert.Equal(t, "xxx", got.AssetType())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, "yyy", got.URL())
}

func TestAsset_CreatedAt(t *testing.T) {
    aid := NewID()
    pid := NewProjectID()
    uid := NewUserID()
    var size uint64 = 15
    got := Asset{
        id:        aid,
        projectID: pid,
        createdBy: uid,
        fileName:  "hoge",
        assetType: "xxx",
        size:      size,
        url:       "yyy",
    }
    assert.Equal(t, time.Time{}, got.CreatedAt())
}