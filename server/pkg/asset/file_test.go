package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFile_FileType(t *testing.T) {
	c := []*File{}
	var size uint64 = 15
	got := File{}

	got.SetName("hoge")
	got.SetSize(size)
	got.SetContentType("xxx")
	got.SetPath("yyy")
	got.SetChildren(c...)

	assert.Equal(t, "hoge", got.Name())
	assert.Equal(t, size, got.Size())
	assert.Equal(t, "xxx", got.ContentType())
	assert.Equal(t, "yyy", got.Path())
	assert.Equal(t, c, got.Children())
}

func TestFile_Children(t *testing.T) {
	// nil file should return nil children
	var got *File = nil
	assert.Nil(t, got.Children())

	// file.Children() should return file.children
	c := []*File{}
	got = &File{
		children: c,
	}
	assert.Equal(t, c, got.Children())
}

func TestFile_SetChildren(t *testing.T) {
	f := File{}
	c := []*File{&f}
	got := File{}

	got.SetChildren(c...)
	assert.Equal(t, got.Children(), c)
}
