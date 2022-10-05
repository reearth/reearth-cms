package integration

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*Integration

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Integration) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(m *Integration) *Integration { return m.Clone() })
}
