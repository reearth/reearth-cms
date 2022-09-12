package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

type ItemLoader struct {
	usecase interfaces.Item
}

func NewItemLoader(usecase interfaces.Item) *ItemLoader {
	return &ItemLoader{usecase: usecase}
}

func (c *ItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	iIds, err := util.TryMap(ids, gqlmodel.ToID[id.Item])
	if err != nil {
		return nil, []error{err}
	}

	res, err := c.usecase.FindByIDs(ctx, iIds, getOperator(ctx))
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(m *item.Item, i int) *gqlmodel.Item {
		return gqlmodel.ToItem(m)
	}), nil
}

// data loader

type ItemDataLoader interface {
	Load(gqlmodel.ID) (*gqlmodel.Item, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (c *ItemLoader) DataLoader(ctx context.Context) ItemDataLoader {
	return gqldataloader.NewItemLoader(gqldataloader.ItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *ItemLoader) OrdinaryDataLoader(ctx context.Context) ItemDataLoader {
	return &ordinaryItemLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error)
}

func (l *ordinaryItemLoader) Load(key gqlmodel.ID) (*gqlmodel.Item, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryItemLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.Item, []error) {
	return l.fetch(keys)
}
