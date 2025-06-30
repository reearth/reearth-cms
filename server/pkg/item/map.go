package item

import "github.com/samber/lo"

type Map map[ID]*Item

func NewMap(items List) Map {
	if items == nil {
		return nil
	}

	m := make(Map, len(items))
	for _, item := range items {
		if item != nil {
			m[item.ID()] = item
		}
	}
	return m
}

func (m Map) Item(iID ID) (*Item, bool) {
	if m == nil {
		return nil, false
	}
	i, ok := m[iID]
	return i, ok
}

func (m Map) Items() List {
	if m == nil {
		return nil
	}
	return lo.Values(m)
}
