package publicapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
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

	item, err := c.usecases.Item.FindByID(ctx, iid, adapter.Operator(ctx))
	if err != nil {
		return Item{}, err
	}

	return ToItem(item), nil
}

func (c *Controller) GetItems(ctx context.Context, prj, model string) (ListResult[Item], error) {
	if err := c.checkProject(ctx, prj); err != nil {
		return ListResult[Item]{}, err
	}

	mid, err := id.ModelIDFrom(model)
	if err != nil {
		return ListResult[Item]{}, err
	}

	items, pi, err := c.usecases.Item.FindByModel(ctx, mid, usecasex.NewPagination(
		nil, nil, nil, nil, // TODO
	), adapter.Operator(ctx))
	if err != nil {
		return ListResult[Item]{}, err
	}

	res := ToListResult[Item](pi)
	res.Results = util.Map(items, ToItem)
	return res, nil
}
