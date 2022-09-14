package asset

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*Asset

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Asset) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(p *Asset) *Asset { return p.Clone() })
}
