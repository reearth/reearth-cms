package schema

import (
	"github.com/reearth/reearth-cms/server/pkg/util"
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
