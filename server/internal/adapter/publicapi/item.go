package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func (c *Controller) GetItem(ctx context.Context, wAlias, pAlias, mKey, iID string) (Item, error) {
	_, m, aPublic, err := c.accessibilityCheck(ctx, wAlias, pAlias, mKey)
	if err != nil {
		return Item{}, err
	}

	if mKey == "" {
		return Item{}, rerror.ErrNotFound
	}

	iid, err := id.ItemIDFrom(iID)
	if err != nil {
		return Item{}, rerror.ErrNotFound
	}

	it, err := c.usecases.Item.FindPublicByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Item{}, rerror.ErrNotFound
		}
		return Item{}, err
	}

	itv := it.Value()

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return Item{}, err
	}

	var assets asset.List
	if aPublic {
		assets, err = c.usecases.Asset.FindByIDs(ctx, itv.AssetIDs(), nil)
		if err != nil {
			return Item{}, err
		}
	}

	return NewItem(itv, sp, assets, getReferencedItems(ctx, itv, aPublic)), nil
}

func (c *Controller) GetPublicItems(ctx context.Context, wAlias, pAlias, mKey string, p ListParam) (item.List, *schema.Package, bool, asset.List, *usecasex.PageInfo, error) {
	_, m, aPublic, err := c.accessibilityCheck(ctx, wAlias, pAlias, mKey)
	if err != nil {
		return nil, nil, false, nil, nil, err
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, m.ID(), nil)
	if err != nil {
		return nil, nil, false, nil, nil, err
	}

	items, pi, err := c.usecases.Item.FindPublicByModel(ctx, m.ID(), p.Pagination, nil)
	if err != nil {
		return nil, nil, false, nil, nil, err
	}

	var refAssets asset.List
	if aPublic {
		assetIDs := lo.FlatMap(items, func(i *item.Item, _ int) []id.AssetID {
			return i.AssetIDs()
		})
		refAssets, err = c.usecases.Asset.FindByIDs(ctx, assetIDs, nil)
		if err != nil {
			return nil, nil, false, nil, nil, err
		}
	}

	// TODO: prefetch referenced items to avoid N+1 queries

	return items, sp, aPublic, refAssets, pi, nil
}

func getReferencedItems(ctx context.Context, i *item.Item, prp bool) []Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	var vi []Item
	for _, f := range i.Fields().FieldsByType(value.TypeReference) {
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := uc.Item.FindByID(ctx, iid, op)
			if err != nil || ii == nil {
				continue
			}
			sp, err := uc.Schema.FindByModel(ctx, ii.Value().Model(), op)
			if err != nil {
				continue
			}
			var assets asset.List
			if prp {
				assets, err = uc.Asset.FindByIDs(ctx, ii.Value().AssetIDs(), nil)
				if err != nil {
					continue
				}
			}
			vi = append(vi, NewItem(ii.Value(), sp, assets, nil))
		}
	}

	return vi
}

func getReferencedItemsMap(ctx context.Context, itemL item.List, prp bool) map[id.ItemID][]Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if itemL == nil {
		return map[id.ItemID][]Item{}
	}

	refItemsIDs := item.IDList{}
	refItemsFn(itemL, func(_, riid id.ItemID) {
		refItemsIDs = refItemsIDs.AddUniq(riid)
	})

	refItemL, err := uc.Item.FindByIDs(ctx, refItemsIDs, op)
	if err != nil {
		return map[id.ItemID][]Item{}
	}
	refItemMap := refItemL.ToMap()

	spMap := map[id.ModelID]*schema.Package{}
	res := map[id.ItemID][]Item{}
	refItemsFn(itemL, func(iid, riid id.ItemID) {
		ii, ok := refItemMap[riid]
		if !ok || ii == nil {
			return
		}
		if _, ok := spMap[ii.Value().Model()]; !ok {
			sp, err := uc.Schema.FindByModel(ctx, ii.Value().Model(), op)
			if err != nil {
				return
			}
			spMap[ii.Value().Model()] = sp
		}
		res[iid] = append(res[iid], NewItem(ii.Value(), spMap[ii.Value().Model()], nil, nil))
	})
	return res
}

func refItemsFn(il item.List, fn func(id.ItemID, id.ItemID)) {
	for _, i := range il {
		for _, f := range i.Fields().FieldsByType(value.TypeReference) {
			for _, v := range f.Value().Values() {
				refItemId, ok := v.Value().(id.ItemID)
				if !ok {
					continue
				}
				fn(i.ID(), refItemId)
			}
		}
	}
}
