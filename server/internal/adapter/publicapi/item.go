package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (c *Controller) GetItem(ctx context.Context, prj, i string) (Item, error) {
	if err := c.checkProject(ctx, prj); err != nil {
		return Item{}, err
	}

	iid, err := id.ItemIDFrom(i)
	if err != nil {
		return Item{}, err
	}

	it, err := c.usecases.Item.FindPublicByID(ctx, iid, nil)
	if err != nil {
		return Item{}, err
	}

	itv := it.Value()
	m, err := c.usecases.Model.FindByID(ctx, itv.Model(), nil)
	if err != nil {
		return Item{}, err
	}

	s, err := c.usecases.Schema.FindByID(ctx, m.Schema(), nil)
	if err != nil {
		return Item{}, err
	}

	assets, err := c.usecases.Asset.FindByIDs(ctx, itv.AssetIDs(), nil)
	if err != nil {
		return Item{}, err
	}

	return NewItem(itv, s, assets, c.assetUrlResolver), nil
}

func (c *Controller) GetItems(ctx context.Context, prj, model string, p ListParam) (ListResult[Item], error) {
	if err := c.checkProject(ctx, prj); err != nil {
		return ListResult[Item]{}, err
	}

	mid, err := id.ModelIDFrom(model)
	if err != nil {
		return ListResult[Item]{}, err
	}

	m, err := c.usecases.Model.FindByID(ctx, mid, nil)
	if err != nil {
		return ListResult[Item]{}, err
	}

	s, err := c.usecases.Schema.FindByID(ctx, m.Schema(), nil)
	if err != nil {
		return ListResult[Item]{}, err
	}

	items, pi, err := c.usecases.Item.FindPublicByModel(ctx, mid, p.Pagination(), nil)
	if err != nil {
		return ListResult[Item]{}, err
	}

	assetIDs := lo.FlatMap(items.Unwrap(), func(i *item.Item, _ int) []id.AssetID {
		return i.AssetIDs()
	})
	assets, err := c.usecases.Asset.FindByIDs(ctx, assetIDs, adapter.Operator(ctx))
	if err != nil {
		return ListResult[Item]{}, err
	}

	res := NewListResult(util.Map(items.Unwrap(), func(i *item.Item) Item {
		return NewItem(i, s, assets, c.assetUrlResolver)
	}), pi, p.Limit, p.Offset)
	return res, nil
}
