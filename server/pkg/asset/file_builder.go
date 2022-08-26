package asset

import (
	"golang.org/x/exp/slices"
)

type FileBuilder struct {
	f *File
}

func NewFile() *FileBuilder {
	return &FileBuilder{f: &File{}}
}

func (b *FileBuilder) Build() (*File, error) {
	if b.f.size == 0 {
		return nil, ErrZeroSize
	}
	return b.f, nil
}

func (b *FileBuilder) MustBuild() *File {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *FileBuilder) Name(name string) *FileBuilder {
	b.f.name = name
	return b
}

func (b *FileBuilder) Size(size uint64) *FileBuilder {
	b.f.size = size
	return b
}

func (b *FileBuilder) Type(t string) *FileBuilder {
	b.f.contentType = t
	return b
}

func (b *FileBuilder) Path(path string) *FileBuilder {
	b.f.path = path
	return b
}

func (b *FileBuilder) Children(children []*File) *FileBuilder {
	b.f.children = slices.Clone(children)
	return b
}
