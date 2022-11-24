package request

import "github.com/reearth/reearth-cms/server/pkg/version"

type Item struct {
	item    ItemID
	version version.Version
}

func (i *Item) Item() ItemID {
	return i.item
}

func (i *Item) Version() version.Version {
	return i.version
}

func NewItem(i ItemID, v version.Version) (*Item, error) {
	if i.IsNil() {
		return nil, ErrInvalidID
	}
	return &Item{
		item:    i,
		version: v,
	}, nil
}
