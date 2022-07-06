package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Builder struct {
	a *Asset
}

func New() *Builder {
	return &Builder{a: &Asset{}}
}

func (b *Builder) Build() (*Asset, error) {
	if b.a.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.a.projectID.IsNil() {
		return nil, ErrEmptyProjectID
	}
	if b.a.createdAt.IsZero() {
		b.a.createdAt = b.a.id.Timestamp()
	}
	return b.a, nil
}

func (b *Builder) MustBuild() *Asset {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.a.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.a.id = NewID()
	return b
}

func (b *Builder) Project(pid ProjectID) *Builder {
	b.a.projectID = pid
	return b
}

func (b *Builder) FileName(name string) *Builder {
	b.a.fileName = name
	return b
}

func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.a.createdAt = createdAt
	return b
}

func (b *Builder) CreatedBy(createdBy UserID) *Builder {
	b.a.createdBy = createdBy
	return b
}

func (b *Builder) Files(files id.AssetFileIDList) *Builder {
	b.a.files = files.Clone()
	return b
}

func (b *Builder) Size(size uint64) *Builder {
	b.a.size = size
	return b
}

func (b *Builder) Type(t string) *Builder {
	b.a.assetType = t
	return b
}
