package item

import (
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type BuilderGroupField struct {
	gf *GroupField
}

func NewGroupField() *BuilderGroupField {
	return &BuilderGroupField{gf: &GroupField{}}
}

func (b *BuilderGroupField) Build() (*GroupField, error) {
	if b.gf.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.gf.schema.IsNil() {
		return nil, ErrInvalidID
	}
	if b.gf.project.IsNil() {
		return nil, ErrInvalidID
	}
	if b.gf.model.IsNil() {
		return nil, ErrInvalidID
	}
	if b.gf.group.IsNil() {
		return nil, ErrInvalidID
	}
	return b.gf, nil
}

func (b *BuilderGroupField) MustBuild() *GroupField {
	return lo.Must(b.Build())
}

func (b *BuilderGroupField) ID(id GroupFieldID) *BuilderGroupField {
	b.gf.id = id
	return b
}

func (b *BuilderGroupField) NewID() *BuilderGroupField {
	b.gf.id = NewGroupFieldID()
	return b
}

func (b *BuilderGroupField) Fields(fields []*Field) *BuilderGroupField {
	if len(fields) == 0 {
		b.gf.fields = nil
		return b
	}
	b.gf.fields = slices.Clone(fields)
	return b
}

func (b *BuilderGroupField) Schema(sid schema.ID) *BuilderGroupField {
	b.gf.schema = sid
	return b
}

func (b *BuilderGroupField) Model(mid ModelID) *BuilderGroupField {
	b.gf.model = mid
	return b
}

func (b *BuilderGroupField) Project(pid ProjectID) *BuilderGroupField {
	b.gf.project = pid
	return b
}

func (b *BuilderGroupField) Group(gid GroupID) *BuilderGroupField {
	b.gf.group = gid
	return b
}
