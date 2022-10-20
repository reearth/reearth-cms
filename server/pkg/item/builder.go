package item

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type Builder struct {
	i *Item
}

func New() *Builder {
	return &Builder{i: &Item{}}
}

func (b *Builder) Build() (*Item, error) {
	if b.i.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.i.schema.IsNil() {
		return nil, ErrInvalidID
	}
	if b.i.project.IsNil() {
		return nil, ErrInvalidID
	}
	return b.i, nil
}

func (b *Builder) MustBuild() *Item {
	return lo.Must(b.Build())
}

func (b *Builder) ID(id ID) *Builder {
	b.i.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.i.id = NewID()
	return b
}

func (b *Builder) Fields(fs []*Field) *Builder {
	b.i.fields = slices.Clone(fs)
	return b
}

func (b *Builder) Schema(sid schema.ID) *Builder {
	b.i.schema = sid
	return b
}

func (b *Builder) Project(pid ProjectID) *Builder {
	b.i.project = pid
	return b
}
