package view

import "golang.org/x/exp/slices"

type List []*View

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *View) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}
