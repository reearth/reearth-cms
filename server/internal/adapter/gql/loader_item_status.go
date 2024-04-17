package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
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

type ItemStatusDataLoader interface {
	Load(gqlmodel.ID) (gqlmodel.ItemStatus, error)
	LoadAll([]gqlmodel.ID) ([]gqlmodel.ItemStatus, []error)
}

func (c *ItemStatusLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]gqlmodel.ItemStatus, []error) {
	op := getOperator(ctx)
	iIDs, err := gqlmodel.ToIDs[id.Item](ids)
	if err != nil {
		return nil, []error{err}
	}

	statusMap, err := c.itemUsecase.ItemStatus(ctx, iIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(iIDs, func(id item.ID, _ int) gqlmodel.ItemStatus {
		return gqlmodel.ToItemStatus(statusMap[id])
	}), nil
}

func (c *ItemStatusLoader) DataLoader(ctx context.Context) ItemStatusDataLoader {
	return gqldataloader.NewItemStatusLoader(gqldataloader.ItemStatusLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]gqlmodel.ItemStatus, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ItemStatusLoader) OrdinaryDataLoader(ctx context.Context) ItemStatusDataLoader {
	return &ordinaryItemStatusLoader{
		fetch: func(keys []gqlmodel.ID) ([]gqlmodel.ItemStatus, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryItemStatusLoader struct {
	fetch func(keys []gqlmodel.ID) ([]gqlmodel.ItemStatus, []error)
}

func (l *ordinaryItemStatusLoader) Load(key gqlmodel.ID) (gqlmodel.ItemStatus, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return "", errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return "", nil
}

func (l *ordinaryItemStatusLoader) LoadAll(keys []gqlmodel.ID) ([]gqlmodel.ItemStatus, []error) {
	return l.fetch(keys)
}
