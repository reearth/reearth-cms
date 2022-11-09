package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/util"
)

func (c *Controller) GetItem(ctx context.Context, prj, i string) (Item, error) {
	if err := c.checkProject(ctx, prj); err != nil {
		return Item{}, err
	}

	iid, err := id.ItemIDFrom(i)
	if err != nil {
		return Item{}, err
	}

	item, err := c.usecases.Item.FindPublicByID(ctx, iid, adapter.Operator(ctx))
	if err != nil {
		return Item{}, err
	}

	return NewItem(item), nil
}

func (c *Controller) GetItems(ctx context.Context, prj, model string, p ListParam) (ListResult[Item], error) {
	if err := c.checkProject(ctx, prj); err != nil {
		return ListResult[Item]{}, err
	}

	mid, err := id.ModelIDFrom(model)
	if err != nil {
		return ListResult[Item]{}, err
	}

	items, pi, err := c.usecases.Item.FindPublicByModel(ctx, mid, p.Pagination(), adapter.Operator(ctx))
	if err != nil {
		return ListResult[Item]{}, err
	}

	res := NewListResult(util.Map(items, NewItem), pi, p.Limit, p.Offset)
	return res, nil
}
