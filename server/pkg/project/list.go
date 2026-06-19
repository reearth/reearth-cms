package project

import (
	"slices"

	"github.com/reearth/reearthx/util"
)

type List []*Project

func (l List) IDs() IDList {
	ids := make(IDList, 0, len(l))
	for _, p := range l {
		ids = append(ids, p.ID())
	}
	return ids
}

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

func (l List) OrderByIds(ids IDList) List {
	m := make(map[ID]*Project)
	for _, p := range l {
		m[p.ID()] = p
	}
	res := make(List, 0, len(ids))
	for _, id := range ids {
		if p, ok := m[id]; ok {
			res = append(res, p)
		}
	}
	return res
}
