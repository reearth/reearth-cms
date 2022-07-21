package asset

import (
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/user"
	"github.com/stretchr/testify/assert"
)

func TestAssetFile_AssetFileType(t *testing.T) {
	uid := NewUserID()
	u := user.New().ID(uid).Email("test@test.com").MustBuild()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	c := []*AssetFile{}
	var size uint64 = 15

	got := AssetFile{
		name:         "hoge",
		size:         size,
		contentType:  "xxx",
		uploadedAt:   tim,
		uploadedBy:   u,
		uploadedById: uid,
		path:         "yyy",
		children:     c,
	}

	assert.Equal(t, "hoge", got.Name())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, "xxx", got.ContentType())
	assert.Equal(t, tim, got.UploadedAt())
	assert.Equal(t, u, got.UploadedBy())
	assert.Equal(t, uid, got.UploadedByID())
	assert.Equal(t, "yyy", got.Path())
	assert.Equal(t, c, got.Children())
}

func TestAssetFile_Children(t *testing.T) {
	// nil file should return nil children
	var got AssetFile
	assert.Nil(t, got.Children())

	// file.Children() should return file.children
	c := []*AssetFile{}
	got = AssetFile{
		children: c,
	}
	assert.Equal(t, c, got.Children())
}

func TestAssetFile_AddChildren(t *testing.T) {
	c1 := []*AssetFile{}
	af := AssetFile{}
	c := append(c1, &af)
	tests := []struct {
		name     string
		input    *AssetFile
		want     []*AssetFile
		children []*AssetFile
	}{
		{
			name: "should add one child",
			input: &AssetFile{},
			children: c,
			want:     c,
		}, {
			name:     "nil asset file, should add nothing",
			children: c,
			want:     nil,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(tt *testing.T) {
			tt.Parallel()
			tc.input.AddChildren(tc.children...)
			assert.Equal(t, tc.want, tc.input.Children())
		})
	}
}
