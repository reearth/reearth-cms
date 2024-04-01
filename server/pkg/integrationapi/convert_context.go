package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ConvertContext struct {
	aMap     asset.Map
	aFiles   map[asset.ID]*asset.File
	aBaseURL func(a *asset.Asset) string
	aEmbed   bool
	afEmbed  bool

	loaders Loaders
	rItems  item.VersionedList
	mItems  item.VersionedList
}

type Loaders struct {
	Asset    func([]id.AssetID) (asset.List, error)
	AssetURL func(*asset.Asset) string
	Item     func([]id.ItemID) (item.VersionedList, error)
}

func NewCC(il item.VersionedList, embedAssets, embedAssetsFiles bool, l Loaders) (*ConvertContext, error) {
	cc := &ConvertContext{
		aFiles:   make(map[asset.ID]*asset.File),
		aBaseURL: l.AssetURL,
		aEmbed:   embedAssets,
		loaders:  l,
	}
	if il == nil {
		return cc, nil
	}
	if err := cc.loadReferencedItems(il); err != nil {
		return nil, err
	}
	if err := cc.loadMetaItems(il); err != nil {
		return nil, err
	}
	if embedAssets {
		if err := cc.loadAssets(il); err != nil {
			return nil, err
		}
	}
	return cc, nil
}

func (c *ConvertContext) loadAssets(il item.VersionedList) error {
	assetsIDs := lo.Uniq(lo.FlatMap(il, func(v item.Versioned, _ int) []id.AssetID {
		return v.Value().AssetIDs()
	}))

	res, err := c.loaders.Asset(assetsIDs)
	if err != nil {
		return err
	}

	c.aMap = res.Map()
	return nil
}

func (c *ConvertContext) loadReferencedItems(il item.VersionedList) error {
	if il == nil {
		return nil
	}

	refIDs := lo.FlatMap(il, func(i item.Versioned, _ int) []id.ItemID {
		return lo.FlatMap(i.Value().Fields().FieldsByType(value.TypeReference), func(f *item.Field, _ int) []id.ItemID {
			return lo.FilterMap(f.Value().Values(), func(v *value.Value, _ int) (id.ItemID, bool) {
				iid, ok := v.Value().(id.ItemID)
				return iid, ok
			})
		})
	})

	refItems, err := c.loaders.Item(refIDs)
	if err != nil {
		return err
	}
	c.rItems = refItems
	return nil
}

func (c *ConvertContext) loadMetaItems(il item.VersionedList) error {
	miIDs := util.Map(il, func(itm item.Versioned) id.ItemID {
		return lo.FromPtr(itm.Value().MetadataItem())
	})

	mi, err := c.loaders.Item(miIDs)
	if err != nil {
		return err
	}

	c.mItems = mi
	return nil
}

func (c *ConvertContext) ShouldEmbedAsset() bool {
	return c != nil && c.aEmbed
}

func (c *ConvertContext) ResolveAsset(id asset.ID) *Asset {
	if c == nil || c.aMap == nil {
		return nil
	}

	a, ok := c.aMap[id]
	if !ok {
		return nil
	}

	url := ""
	if c.aBaseURL != nil {
		url = c.aBaseURL(a)
	}

	f := c.aFiles[id]

	return NewAsset(a, f, url, c.aEmbed)
}

func (c *ConvertContext) ResolveMetaItem(id item.ID) item.Versioned {
	if c == nil || c.mItems == nil {
		return nil
	}
	return c.mItems.Item(id)
}

func (c *ConvertContext) ResolveReferencedItem(itemID id.ItemID) item.Versioned {
	if c.rItems == nil {
		return nil
	}
	return c.rItems.Item(itemID)
}
