package asset

import (
	"golang.org/x/exp/slices"
)

type File struct {
	name        string
	size        uint64
	contentType string
	path        string
	children    []*File
}

func (f *File) Name() string {
	return f.name
}

func (f *File) Size() uint64 {
	return f.size
}

func (f *File) ContentType() string {
	return f.contentType
}

func (f *File) Path() string {
	return f.path
}

func (f *File) Children() []*File {
	if f == nil {
		return nil
	}
	return slices.Clone(f.children)
}

func (f *File) SetChildren(children ...*File) {
	f.children = slices.Clone(children)
}
