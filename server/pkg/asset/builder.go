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
	if b.a.project.IsNil() {
		return nil, ErrNoProjectID
	}
	if b.a.createdBy.IsNil() {
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

func (b *Builder) Project(pid ProjectID) *Builder {
	b.a.project = pid
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

func (b *Builder) File(t *File) *Builder {
	b.a.file = t
	return b
}

func (b *Builder) Hash(hash string) *Builder {
	b.a.hash = hash
	return b
}

func (b *Builder) Thread(th ThreadID) *Builder {
	b.a.thread = th
	return b
}
