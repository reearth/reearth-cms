package publicApi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

type PublicAPIController struct {
	usecase interfaces.PublicAPI
}

func NewPublicAPIController(usecase interfaces.PublicAPI) *PublicAPIController {
	return &PublicAPIController{
		usecase: usecase,
	}
}

func (c *Controller) GetItem(ctx context.Context, prj, id string) (Item, error) {
	i, err := c.GetItem(ctx, prj, id)
	if err != nil {
		return Item{}, err
	}
	return Item{
		ID:     i.ID,
		Fields: i.Fields,
	}, nil
}

func (c *Controller) GetItems(ctx context.Context, prj, schema string) (ListResult[Item], error) {
	i, err := c.GetItems(ctx, prj, schema)
	if err != nil {
		return ListResult[Item]{}, err
	}
	return ListResult[Item]{
		Results:    i.Results,
		TotalCount: i.TotalCount,
		Limit:      i.Limit,
		Offset:     i.Offset,
	}, nil
}
