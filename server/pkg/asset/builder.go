package asset

import (
	"time"
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
	if b.a.projectId.IsNil() {
		return nil, ErrNoProjectID
	}
	if b.a.createdById.IsNil() {
		return nil, ErrNoUser
	}
	if b.a.size == 0 {
		return nil, ErrZeroSize
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

func (b *Builder) ProjectID(pid ProjectID) *Builder {
	b.a.projectId = pid
	return b
}

func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.a.createdAt = createdAt
	return b
}

func (b *Builder) CreatedByID(createdById UserID) *Builder {
	b.a.createdById = createdById
	return b
}

func (b *Builder) FileName(name string) *Builder {
	b.a.fileName = name
	return b
}

func (b *Builder) Size(size uint64) *Builder {
	b.a.size = size
	return b
}

func (b *Builder) Type(t *PreviewType) *Builder {
	b.a.previewType = t
	return b
}

func (b *Builder) File(t *AssetFile) *Builder {
	b.a.file = t
	return b
}

func (b *Builder) Hash(hash string) *Builder {
	b.a.hash = hash
	return b
}
