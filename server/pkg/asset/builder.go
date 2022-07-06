package asset

import "time"

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

	if b.a.createdAt.IsZero() {
		b.a.createdAt = b.a.CreatedAt()
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

func (b *Builder) Name(name string) *Builder {
	b.a.fileName = name
	return b
}

func (b *Builder) CreatedAt(createdAt time.Time) *Builder {
	b.a.createdAt = createdAt
	return b
}

func (b *Builder) Files(files []*File) *Builder {
	b.a.files = files
	return b
}
