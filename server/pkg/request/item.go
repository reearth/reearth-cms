package request

import "github.com/reearth/reearth-cms/server/pkg/version"

type Item struct {
	item    ItemID
	pointer version.VersionOrRef
}

func (i *Item) Item() ItemID {
	return i.item
}

func (i *Item) Version() version.VersionOrRef {
	return i.pointer
}

func NewItem(i ItemID, v version.VersionOrRef) (*Item, error) {
	if i.IsNil() {
		return nil, ErrInvalidID
	}
	return &Item{
		item:    i,
		pointer: v,
	}, nil
}
