package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/samber/lo"
)

type ItemStatusLoader struct {
	itemUsecase interfaces.Item
}

func NewItemStatusLoader(itemUsecase interfaces.Item) *ItemStatusLoader {
	return &ItemStatusLoader{itemUsecase: itemUsecase}
}

func (c *ItemStatusLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.ItemStatus, []error) {
	op := getOperator(ctx)
	iIDs, err := gqlmodel.ToIDs[id.Item](ids)
	if err != nil {
		return nil, []error{err}
	}

	statusMap, err := c.itemUsecase.ItemStatus(ctx, iIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(iIDs, func(id item.ID, _ int) *gqlmodel.ItemStatus {
		return lo.ToPtr(gqlmodel.ToItemStatus(statusMap[id]))
	}), nil
}
