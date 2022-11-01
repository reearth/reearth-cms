package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type List []*Schema

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Schema) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(s *Schema) *Schema { return s.Clone() })
}

type FieldList []*Field

func (l FieldList) SortByID() FieldList {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Field) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}

func (l FieldList) Clone() FieldList {
	return util.Map(l, func(f *Field) *Field { return f.Clone() })
}

func (l FieldList) IDs() (ids id.FieldIDList) {
	for _, sf := range l {
		ids = ids.Add(sf.ID())
	}
	return
}

func (l FieldList) FindByID(id FieldID) *Field {
	sf, _ := lo.Find(l, func(sf *Field) bool {
		return sf.ID() == id
	})
	return sf
}
