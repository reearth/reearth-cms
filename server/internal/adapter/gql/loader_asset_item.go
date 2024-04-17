package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqldataloader"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/samber/lo"
)

type AssetItemLoader struct {
	itemUsecase interfaces.Item
}

func NewAssetItemLoader(itemUsecase interfaces.Item) *AssetItemLoader {
	return &AssetItemLoader{itemUsecase: itemUsecase}
}

type AssetItemDataLoader interface {
	Load(gqlmodel.ID) ([]*gqlmodel.AssetItem, error)
	LoadAll([]gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error)
}

func (c *AssetItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error) {
	op := getOperator(ctx)
	aIDs, err := gqlmodel.ToIDs[id.Asset](ids)
	if err != nil {
		return nil, []error{err}
	}

	itemsMap, err := c.itemUsecase.FindByAssets(ctx, aIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(aIDs, func(id asset.ID, _ int) []*gqlmodel.AssetItem {
		return lo.Map(itemsMap[id], func(itm item.Versioned, _ int) *gqlmodel.AssetItem {
			return &gqlmodel.AssetItem{
				ItemID:  gqlmodel.IDFrom(itm.Value().ID()),
				ModelID: gqlmodel.IDFrom(itm.Value().Model()),
			}
		})
	}), nil
}

func (c *AssetItemLoader) DataLoader(ctx context.Context) AssetItemDataLoader {
	return gqldataloader.NewAssetItemLoader(gqldataloader.AssetItemLoaderConfig{
		Wait:     dataLoaderWait,
		MaxBatch: dataLoaderMaxBatch,
		Fetch: func(keys []gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error) {
			return c.Fetch(ctx, keys)
		},
	})
}

func (c *AssetItemLoader) OrdinaryDataLoader(ctx context.Context) AssetItemDataLoader {
	return &ordinaryAssetItemLoader{
		fetch: func(keys []gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error) {
			return c.Fetch(ctx, keys)
		},
	}
}

type ordinaryAssetItemLoader struct {
	fetch func(keys []gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error)
}

func (l *ordinaryAssetItemLoader) Load(key gqlmodel.ID) ([]*gqlmodel.AssetItem, error) {
	res, errs := l.fetch([]gqlmodel.ID{key})
	if len(errs) > 0 {
		return nil, errs[0]
	}
	if len(res) > 0 {
		return res[0], nil
	}
	return nil, nil
}

func (l *ordinaryAssetItemLoader) LoadAll(keys []gqlmodel.ID) ([][]*gqlmodel.AssetItem, []error) {
	return l.fetch(keys)
}
