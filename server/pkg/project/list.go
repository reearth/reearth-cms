package project

import (
	"github.com/reearth/reearthx/util"
	"golang.org/x/exp/slices"
)

type List []*Project

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Project) int {
		return a.ID().Compare(b.ID())
	})
	return m
}

func (l List) Clone() List {
	return util.Map(l, func(p *Project) *Project { return p.Clone() })
}
