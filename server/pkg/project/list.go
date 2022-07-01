package project

import "golang.org/x/exp/slices"

type List []*Project

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Project) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}
