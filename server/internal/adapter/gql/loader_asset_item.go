package gql

import (
	"context"

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

func (c *AssetItemLoader) Fetch(ctx context.Context, ids []gqlmodel.ID) ([]*[]gqlmodel.AssetItem, []error) {
	op := getOperator(ctx)
	aIDs, err := gqlmodel.ToIDs[id.Asset](ids)
	if err != nil {
		return nil, []error{err}
	}

	itemsMap, err := c.itemUsecase.FindByAssets(ctx, aIDs, op)
	if err != nil {
		return nil, []error{err}
	}

	return lo.Map(aIDs, func(id asset.ID, _ int) *[]gqlmodel.AssetItem {
		return lo.ToPtr(lo.Map(itemsMap[id], func(itm item.Versioned, _ int) gqlmodel.AssetItem {
			return gqlmodel.AssetItem{
				ItemID:  gqlmodel.IDFrom(itm.Value().ID()),
				ModelID: gqlmodel.IDFrom(itm.Value().Model()),
			}
		}))
	}), nil
}
