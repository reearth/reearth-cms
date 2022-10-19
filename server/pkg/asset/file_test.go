package asset

import (
	"fmt"
	"path"
	"testing"

	"github.com/stretchr/testify/assert"
)

// func TestFile_FileType(t *testing.T) {
// 	c := []*File{}
// 	var size uint64 = 15
// 	got := File{}

// 	got.SetName("hoge")
// 	got.SetSize(size)
// 	got.SetContentType("xxx")
// 	got.SetPath("yyy")
// 	got.SetChildren(c...)

// 	assert.Equal(t, "hoge", got.Name())
// 	assert.Equal(t, size, got.Size())
// 	assert.Equal(t, "xxx", got.ContentType())
// 	assert.Equal(t, "yyy", got.Path())
// 	assert.Equal(t, c, got.Children())
// }

// func TestFile_Children(t *testing.T) {
// 	// nil file should return nil children
// 	var got *File = nil
// 	assert.Nil(t, got.Children())

// 	// file.Children() should return file.children
// 	c := []*File{}
// 	got = &File{
// 		children: c,
// 	}
// 	assert.Equal(t, c, got.Children())
// }

// func TestFile_SetChildren(t *testing.T) {
// 	f := File{}
// 	c := []*File{&f}
// 	got := File{}

// 	got.SetChildren(c...)
// 	assert.Equal(t, got.Children(), c)
// }

func Test_FoldFiles(t *testing.T) {
	assert.Equal(t,
		&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			children: []*File{
				{name: "hello", path: "/hello", size: 0, contentType: "", children: []*File{
					{name: "a.txt", path: "/hello/a.txt", size: 10, contentType: "text/plain"},
					{name: "b.txt", path: "/hello/b.txt", size: 20, contentType: "text/plain"},
				}},
			},
		},
		FoldFiles(
			[]*File{
				{name: "a.txt", path: "/hello/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/hello/b.txt", size: 20, contentType: "text/plain"},
			},
			&File{name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip"},
		),
	)

	assert.Equal(t,
		&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			children: []*File{
				{name: "hello", path: "/hello", size: 0, contentType: "", children: []*File{
					{name: "c.txt", path: "/hello/c.txt", size: 20, contentType: "text/plain"},
					{name: "good", path: "/hello/good", size: 0, contentType: "", children: []*File{
						{name: "a.txt", path: "/hello/good/a.txt", size: 10, contentType: "text/plain"},
						{name: "b.txt", path: "/hello/good/b.txt", size: 10, contentType: "text/plain"},
					}},
				}},
			},
		},
		FoldFiles(
			[]*File{
				{name: "a.txt", path: "/hello/good/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/hello/good/b.txt", size: 10, contentType: "text/plain"},
				{name: "c.txt", path: "/hello/c.txt", size: 20, contentType: "text/plain"},
			},
			&File{name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip"},
		),
	)

}

func Test_Example(t *testing.T) {
	b := "/aaa/bbb/ccc.txt"
	res := path.Base(b)
	fmt.Printf("res ----: %v", res)
}

func Test_RemoveSlicePrefix(t *testing.T) {
	tests := [][][]string{
		{{"a", "b"}, {"a", "b", "c"}, {}, {"c"}},
		{{"a", "b", "c", "d"}, {"a", "b"}, {"c", "d"}, {}},
		{{"a", "b"}, {"x", "y"}, {"a", "b"}, {"x", "y"}},
		{{}, {"x", "y"}, {}, {"x", "y"}},
		{{"a", "b"}, {}, {"a", "b"}, {}},
		{{"a", "b"}, {"a", "b"}, {}, {}},
		{nil, nil, nil, nil},
	}

	for _, tt := range tests {
		t.Run(fmt.Sprintf("%v,%v->%v,%v", tt[0], tt[1], tt[2], tt[3]), func(t *testing.T) {
			a, b := removeSlicePrefix(tt[0], tt[1])
			assert.Equal(t, tt[2], a)
			assert.Equal(t, tt[3], b)
		})
	}
}
