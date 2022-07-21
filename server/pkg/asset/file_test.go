package asset

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestFile_FileType(t *testing.T) {
	uid := NewUserID()
	tim, _ := time.Parse(time.RFC3339, "2021-03-16T04:19:57.592Z")
	c := []*File{}
	var size uint64 = 15

	got := File{
		name:         "hoge",
		size:         size,
		contentType:  "xxx",
		uploadedAt:   tim,
		uploadedById: uid,
		path:         "yyy",
		children:     c,
	}

	assert.Equal(t, "hoge", got.Name())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, "xxx", got.ContentType())
	assert.Equal(t, tim, got.UploadedAt())
	assert.Equal(t, uid, got.UploadedByID())
	assert.Equal(t, "yyy", got.Path())
	assert.Equal(t, c, got.Children())
}

func TestFile_Children(t *testing.T) {
	// nil file should return nil children
	var got File
	assert.Nil(t, got.Children())

	// file.Children() should return file.children
	c := []*File{}
	got = File{
		children: c,
	}
	assert.Equal(t, c, got.Children())
}
