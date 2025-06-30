package item

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/schema"
)

type Bundle struct {
	sp        *schema.Package
	items     Map
	refItems  Map
	refAssets asset.Map
}

func NewBundle(items Map, refItems Map, refAssets asset.Map) *Bundle {
	return &Bundle{
		items:     items,
		refItems:  refItems,
		refAssets: refAssets,
	}
}

func (b *Bundle) Items() List {
	return b.items.Items()
}

func (b *Bundle) Item(iid ID) (*Item, bool) {
	if b == nil {
		return nil, false
	}
	return b.items.Item(iid)
}
