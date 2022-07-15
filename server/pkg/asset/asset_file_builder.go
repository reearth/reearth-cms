package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type AssetFileBuilder struct {
	af *AssetFile
}

func NewAssetFile() *AssetFileBuilder {
	return &AssetFileBuilder{af: &AssetFile{}}
}

func (b *AssetFileBuilder) Build() (*AssetFile, error) {
	if b.af.id.IsNil() {
		return nil, ErrInvalidID
	}
	return b.af, nil
}

func (b *AssetFileBuilder) MustBuild() *AssetFile {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *AssetFileBuilder) ID(id AssetFileID) *AssetFileBuilder {
	b.af.id = id
	return b
}

func (b *AssetFileBuilder) NewID() *AssetFileBuilder {
	b.af.id = NewAssetFileID()
	return b
}

func (b *AssetFileBuilder) Asset(assetID ID) *AssetFileBuilder {
	b.af.assetID = assetID
	return b
}

func (b *AssetFileBuilder) Name(name string) *AssetFileBuilder {
	b.af.name = name
	return b
}

func (b *AssetFileBuilder) UploadedAt(uploadedAt time.Time) *AssetFileBuilder {
	b.af.uploadedAt = uploadedAt
	return b
}

func (b *AssetFileBuilder) UploadedBy(uploadedBy UserID) *AssetFileBuilder {
	b.af.uploadedBy = uploadedBy
	return b
}

func (b *AssetFileBuilder) Children(children id.AssetFileIDList) *AssetFileBuilder {
	b.af.children = children.Clone()
	return b
}

func (b *AssetFileBuilder) Size(size uint64) *AssetFileBuilder {
	b.af.size = size
	return b
}

func (b *AssetFileBuilder) ContentType(t string) *AssetFileBuilder {
	b.af.contentType = t
	return b
}
