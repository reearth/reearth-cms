package item

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
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

func (l List) ItemsBySchemaField(fid id.FieldID, value any) List {
	return lo.Filter(l, func(i *Item, _ int) bool {
		return i.HasField(fid, value)
	})
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

type VersionedList []*version.Value[*Item]

func (l VersionedList) SortByTimestamp() VersionedList {
	m := slices.Clone(l)
	slices.SortFunc(m, func(a, b Versioned) bool {
		return a.Value().timestamp.Before(b.Value().Timestamp())
	})
	return m
}

func (l VersionedList) FilterFields(fields id.FieldIDList) VersionedList {
	return lo.Map(l, func(a Versioned, _ int) Versioned {
		return version.ValueFrom(a, a.Value().FilterFields(fields))
	})
}

func (l VersionedList) Unwrap() List {
	if l == nil {
		return nil
	}
	return version.UnwrapValues(l)
}
