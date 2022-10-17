package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFileBuilder_Name(t *testing.T) {
	name := "aaa"
	f := NewFile().Name(name).Build()
	assert.Equal(t, name, f.Name())
}

func TestFileBuilder_ContentType(t *testing.T) {
	contentType := "image/jpg"
	f := NewFile().ContentType(contentType).Build()
	assert.Equal(t, contentType, f.ContentType())
}

func TestFileBuilder_Path(t *testing.T) {
	path := "hoge"
	f := NewFile().Path(path).Build()
	assert.Equal(t, path, f.Path())
}

func TestFileBuilder_GuessContentType(t *testing.T) {
	f := NewFile().GuessContentType()
	assert.Equal(t, true, f.detectContentType)
}

func TestFileBuilder_Build(t *testing.T) {
	c := []*File{NewFile().Build()}
	// ContentType should be filled automatically
	f := NewFile().Name("aaa").Path("/aaa.jpg").Size(1000).GuessContentType().Children(c).Build()
	assert.Equal(t, "aaa", f.Name())
	assert.Equal(t, "/aaa.jpg", f.Path())
	assert.Equal(t, uint64(1000), f.Size())
	assert.Equal(t, "image/jpeg", f.ContentType())
	assert.Equal(t, c, f.Children())

	// ContentType should be blank
	f2 := NewFile().Name("aaa").Path("/aaa.jpg").Size(1000).Children(c).Build()
	assert.Equal(t, "aaa", f2.Name())
	assert.Equal(t, "/aaa.jpg", f2.Path())
	assert.Equal(t, uint64(1000), f2.Size())
	assert.Zero(t, f2.ContentType())
	assert.Equal(t, c, f2.Children())

}
