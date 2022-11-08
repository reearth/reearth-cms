package item

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
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
	if b.i.model.IsNil() {
		return nil, ErrInvalidID
	}
	if b.i.timestamp.IsZero() {
		b.i.timestamp = util.Now()
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

func (b *Builder) Fields(fields []*Field) *Builder {
	if len(fields) == 0 {
		b.i.fields = nil
		return b
	}
	b.i.fields = lo.Filter(fields, func(i *Field, _ int) bool {
		return i != nil
	})
	return b
}

func (b *Builder) Schema(sid schema.ID) *Builder {
	b.i.schema = sid
	return b
}

func (b *Builder) Model(mid ModelID) *Builder {
	b.i.model = mid
	return b
}

func (b *Builder) Project(pid ProjectID) *Builder {
	b.i.project = pid
	return b
}

func (b *Builder) Timestamp(createdAt time.Time) *Builder {
	b.i.timestamp = createdAt
	return b
}
