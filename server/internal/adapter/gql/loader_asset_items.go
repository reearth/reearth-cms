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

type AssetItemsLoader struct {
	itemUsecase interfaces.Item
}

func NewAssetItemLoader(itemUsecase interfaces.Item) *AssetItemsLoader {
	return &AssetItemsLoader{itemUsecase: itemUsecase}
}

type AssetItemsDataLoader interface {
	Load(gqlmodel.ID) ([]*gqlmodel.AssetItem, error)
	LoadAll([]gqlmodel.ID) ([]*gqlmodel.AssetItem, []error)
}

func (c *AssetItemsLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*gqlmodel.AssetItem, []error) {
	op := getOperator(ctx)
	iIds, err := gqlmodel.ToIDs[id.Asset](ids)
	if err != nil {
		return nil, []error{err}
	}
	res, err := c.itemUsecase.FindByAssets(ctx, iIds, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(res, func(itm item.Versioned, _ int) *gqlmodel.AssetItem {
		return &gqlmodel.AssetItem{
			ItemID:  gqlmodel.IDFrom(itm.Value().ID()),
			ModelID: gqlmodel.IDFrom(itm.Value().Model()),
		}
	}), nil
}

func (c *AssetItemsLoader) DataLoader(ctx context.Context) AssetItemsDataLoader {
	return gqldataloader.NewAssetItemsLoader(gqldataloader.AssetItemsLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.AssetItem, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *AssetItemsLoader) OrdinaryDataLoader(ctx context.Context) AssetItemsDataLoader {
	return &ordinaryAssetItemsLoader{
		fetch: func(keys []gqlmodel.ID) ([]*gqlmodel.AssetItem, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryAssetItemsLoader struct {
	fetch func(keys []gqlmodel.ID) ([]*gqlmodel.AssetItem, []error)
}

func (l *ordinaryAssetItemsLoader) Load(key gqlmodel.ID) ([]*gqlmodel.AssetItem, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res, nil
	}
	return nil, nil
}

func (l *ordinaryAssetItemsLoader) LoadAll(keys []gqlmodel.ID) ([]*gqlmodel.AssetItem, []error) {
	return l.fetch(keys)
}
