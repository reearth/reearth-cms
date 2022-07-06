package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type FileBuilder struct {
	f *File
}

func NewFile() *FileBuilder {
	return &FileBuilder{f: &File{}}
}

func (b *FileBuilder) Build() (*File, error) {
	if b.f.id.IsNil() {
		return nil, ErrInvalidID
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

func (b *FileBuilder) ID(id AssetFileID) *FileBuilder {
	b.f.id = id
	return b
}

func (b *FileBuilder) NewID() *FileBuilder {
	b.f.id = NewAssetFileID()
	return b
}

func (b *FileBuilder) Name(name string) *FileBuilder {
	b.f.name = name
	return b
}

func (b *FileBuilder) UploadedAt(uploadedAt time.Time) *FileBuilder {
	b.f.uploadedAt = uploadedAt
	return b
}

func (b *FileBuilder) UploadedBy(uploadedBy UserID) *FileBuilder {
	b.f.uploadedBy = uploadedBy
	return b
}

func (b *FileBuilder) Children(children id.AssetFileIDList) *FileBuilder {
	b.f.children = children.Clone()
	return b
}

func (b *FileBuilder) Size(size uint64) *FileBuilder {
	b.f.size = size
	return b
}

func (b *FileBuilder) ContentType(t string) *FileBuilder {
	b.f.contentType = t
	return b
}
