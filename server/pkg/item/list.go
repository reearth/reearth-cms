package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"golang.org/x/exp/slices"
)

type List []*Item

func (l List) SortByID() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Item) bool {
		return a.ID().Compare(b.ID()) < 0
	})
	return m
}

func (l List) SortByTimestamp() List {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b *Item) bool {
		return a.timestamp.Before(b.Timestamp())
	})
	return m
}

func (l List) FilterFields(lids id.FieldIDList) List {
	return lo.Map(l, func(i *Item, _ int) *Item {
		return i.FilterFields(lids)
	})
}
