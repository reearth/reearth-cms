package item

import (
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/samber/lo"
)

type List []*Item

func (l List) ItemsByField(fid FieldID, value any) List {
	return lo.Filter(l, func(i *Item, _ int) bool {
		return i.HasField(fid, value)
	})
}

func (l List) FilterFields(lids FieldIDList) List {
	return lo.Map(l, func(i *Item, _ int) *Item {
		return i.FilterFields(lids)
	})
}

func (l List) Item(iID ID) (*Item, bool) {
	return lo.Find(l, func(i *Item) bool {
		return i.ID() == iID
	})
}

func (l List) IDs() IDList {
	return lo.Map(l, func(i *Item, _ int) ID {
		return i.ID()
	})
}

type VersionedList []Versioned

func (l VersionedList) FilterFields(fields FieldIDList) VersionedList {
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

func (l VersionedList) Item(iid ID) Versioned {
	if l == nil {
		return nil
	}
	for _, versioned := range l {
		if versioned.Value().ID() == iid {
			return versioned
		}
	}
	return nil
}

func (l VersionedList) ToMap() map[ID]*version.Value[*Item] {
	m := make(map[ID]*version.Value[*Item], len(l))
	for _, i := range l {
		m[i.Value().ID()] = i
	}
	return m
}
