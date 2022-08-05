package model

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/key"
)

type Builder struct {
	p *Model
	k key.Key
}

func New() *Builder {
	return &Builder{p: &Model{}}
}

func (b *Builder) Build() (*Model, error) {
	if b.p.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.p.schema.IsNil() {
		return nil, ErrInvalidID
	}
	if b.k.IsValid() {
		b.p.key = b.k
	} else {
		return nil, ErrInvalidKey
	}
	if b.p.updatedAt.IsZero() {
		b.p.updatedAt = b.p.CreatedAt()
	}
	return b.p, nil
}

func (b *Builder) MustBuild() *Model {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.p.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.p.id = NewID()
	return b
}

func (b *Builder) Project(p id.ProjectID) *Builder {
	b.p.project = p
	return b
}

func (b *Builder) Schema(s id.SchemaID) *Builder {
	b.p.schema = s
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.p.name = name
	return b
}

func (b *Builder) Description(description string) *Builder {
	b.p.description = description
	return b
}

func (b *Builder) Key(key key.Key) *Builder {
	b.k = key
	return b
}

func (b *Builder) RandomKey() *Builder {
	b.k = key.Random()
	return b
}

func (b *Builder) IsPublic(public bool) *Builder {
	b.p.public = public
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.p.updatedAt = updatedAt
	return b
}
