package model

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type Builder struct {
	model *Model
	k     id.Key
}

func New() *Builder {
	return &Builder{model: &Model{}}
}

func (b *Builder) Build() (*Model, error) {
	if b.model.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.model.schema.IsNil() {
		return nil, ErrInvalidID
	}
	if err := b.model.SetKey(b.k); err != nil {
		return nil, err
	}
	if b.model.updatedAt.IsZero() {
		b.model.updatedAt = b.model.CreatedAt()
	}
	return b.model, nil
}

func (b *Builder) MustBuild() *Model {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.model.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.model.id = NewID()
	return b
}

func (b *Builder) Project(p id.ProjectID) *Builder {
	b.model.project = p
	return b
}

func (b *Builder) Schema(s id.SchemaID) *Builder {
	b.model.schema = s
	return b
}

func (b *Builder) Metadata(m *id.SchemaID) *Builder {
	b.model.metadata = m
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.model.name = name
	return b
}

func (b *Builder) Description(description string) *Builder {
	b.model.description = description
	return b
}

func (b *Builder) Key(key id.Key) *Builder {
	b.k = key
	return b
}

func (b *Builder) RandomKey() *Builder {
	b.k = id.RandomKey()
	return b
}

func (b *Builder) UpdatedAt(updatedAt time.Time) *Builder {
	b.model.updatedAt = updatedAt
	return b
}

func (b *Builder) Order(o int) *Builder {
	b.model.order = o
	return b
}
