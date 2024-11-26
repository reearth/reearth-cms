package asset

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFile_FileType(t *testing.T) {
	c := NewFile().Build()
	fl := []*File{NewFile().Build()}
	f := NewFile().Name("aaa.txt").Path("/aaa.txt").Size(10).GuessContentType().Files(fl).Children([]*File{c}).Build()

	assert.Equal(t, "aaa.txt", f.Name())
	assert.Equal(t, uint64(10), f.Size())
	assert.Equal(t, "text/plain; charset=utf-8", f.ContentType())
	assert.Equal(t, "/aaa.txt", f.Path())
	assert.Equal(t, []*File{c}, f.Children())
	assert.Equal(t, fl, f.Files())

	f.SetName("bbb")
	assert.Equal(t, "bbb", f.Name())

	c2 := NewFile().Build()
	f.AppendChild(c2)
	assert.Equal(t, []*File{c, c2}, f.Children())

	dir := NewFile().Name("dir").Path("/aaa").Children([]*File{c}).Build()
	assert.True(t, dir.IsDir())

	// object is nil test
	f = nil
	assert.Equal(t, "", f.Name())
	assert.Equal(t, uint64(0), f.Size())
	assert.Equal(t, "", f.ContentType())
	assert.Equal(t, "", f.Path())
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

func TestFile_Files(t *testing.T) {
	f := &File{
		path: "aaa",
		children: []*File{
			{
				path: "aaa/a",
				children: []*File{
					{
						path: "aaa/a/a.txt",
					},
				},
			},
			{
				path: "aaa/b.txt",
			},
		},
	}

	tests := []struct {
		name  string
		files *File
		want  []*File
	}{
		{
			name:  "success",
			files: f,
			want: []*File{
				{
					path: "aaa/a/a.txt",
				},
				{
					path: "aaa/b.txt",
				},
			},
		},
		{
			name:  "file object is empyy",
			files: nil,
			want:  nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			flatten := tt.files.FlattenChildren()
			assert.Equal(t, flatten, tt.want)
		})
	}
}

func TestFile_SetFiles(t *testing.T) {
	root := NewFile().Build()
	files := []*File{NewFile().Path("aaa/a/a.txt").Build(), NewFile().Path("aaa/b.txt").Build()}
	root.SetFiles(files)
	assert.Equal(t, files, root.files)

	root2 := NewFile().Path("aaa.zip").Build()
	files2 := []*File{NewFile().Path("aaa.zip").Build(), NewFile().Path("aaa/a/a.txt").Build(), NewFile().Path("aaa/b.txt").Build()}
	expected := []*File{NewFile().Path("aaa/a/a.txt").Build(), NewFile().Path("aaa/b.txt").Build()}
	root2.SetFiles(files2)
	assert.Equal(t, expected, root2.files)
}

func Test_FoldFiles(t *testing.T) {
	assert.Equal(t,
		&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			children: []*File{
				{name: "a.txt", path: "/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/b.txt", size: 20, contentType: "text/plain"},
			},
		},
		FoldFiles(
			[]*File{
				{name: "a.txt", path: "/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/b.txt", size: 20, contentType: "text/plain"},
			},
			&File{name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip"},
		),
	)
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
	assert.Equal(t,
		&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			children: []*File{
				{name: "hello", path: "/hello", size: 0, contentType: "", children: []*File{
					{name: "hello", path: "/hello/hello", children: []*File{
						{name: "a.txt", path: "/hello/hello/a.txt", size: 10, contentType: "text/plain"},
						{name: "b.txt", path: "/hello/hello/b.txt", size: 10, contentType: "text/plain"},
						{name: "c", path: "/hello/hello/c", children: []*File{
							{name: "d.txt", path: "/hello/hello/c/d.txt", size: 20, contentType: "text/plain"},
						}},
					}},
				},
				},
			},
		},
		FoldFiles(
			[]*File{
				{name: "a.txt", path: "/hello/hello/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/hello/hello/b.txt", size: 10, contentType: "text/plain"},
				{name: "d.txt", path: "/hello/hello/c/d.txt", size: 20, contentType: "text/plain"},
			},
			&File{name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip"},
		),
	)

	assert.Equal(t,
		&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			children: []*File{
				{name: "hello", path: "/hello", contentType: "", children: []*File{
					{name: "a.txt", path: "/hello/a.txt", size: 10, contentType: "text/plain"},
				}},
				{name: "hello_a", path: "/hello_a", children: []*File{
					{name: "b.txt", path: "/hello_a/b.txt", size: 10, contentType: "text/plain"},
					{name: "c", path: "/hello_a/c", children: []*File{
						{name: "d.txt", path: "/hello_a/c/d.txt", size: 20, contentType: "text/plain"},
					}},
				}},
			},
		},
		FoldFiles(
			[]*File{
				{name: "a.txt", path: "/hello/a.txt", size: 10, contentType: "text/plain"},
				{name: "b.txt", path: "/hello_a/b.txt", size: 10, contentType: "text/plain"},
				{name: "d.txt", path: "/hello_a/c/d.txt", size: 20, contentType: "text/plain"},
			},
			&File{name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip"},
		),
	)
}

func Test_File_RootPath(t *testing.T) {
	tests := []struct {
		name string
		file *File
		uuid string
		want string
	}{
		{
			name: "success",
			file: &File{path: "hoge.zip"},
			uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			want: "xx/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/hoge.zip",
		},
		{
			name: "File object is nil",
			file: nil,
			uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			result := tt.file.RootPath(tt.uuid)
			assert.Equal(t, result, tt.want)
		})
	}
}

func Test_Clone(t *testing.T) {
	tests := []struct {
		name string
		file *File
		want *File
	}{
		{
			name: "success",
			file: &File{
				name:        "test",
				size:        1,
				contentType: "type",
				path:        "hoge.zip",
				children: []*File{
					{name: "a.txt", path: "/hello/good/a.txt", size: 10, contentType: "text/plain"},
					{name: "b.txt", path: "/hello/good/b.txt", size: 10, contentType: "text/plain"},
				},
			},
			want: &File{
				name:        "test",
				size:        1,
				contentType: "type",
				path:        "hoge.zip",
				children: []*File{
					{name: "a.txt", path: "/hello/good/a.txt", size: 10, contentType: "text/plain"},
					{name: "b.txt", path: "/hello/good/b.txt", size: 10, contentType: "text/plain"},
				},
			},
		},
		{
			name: "file is nil",
			file: nil,
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			cloned := tt.file.Clone()
			assert.Equal(t, cloned, tt.want)
		})
	}
}

func Test_FilePath(t *testing.T) {
	t.Parallel()
	assert.Equal(t,
		[]string{
			"/hello/c.txt",
		},
		(&File{
			name: "hello.zip", path: "/hello.zip", size: 100, contentType: "application/zip",
			files: []*File{
				{name: "c.txt", path: "/hello/c.txt", size: 20, contentType: "text/plain"},
			},
		}).FilePaths(),
	)
}
