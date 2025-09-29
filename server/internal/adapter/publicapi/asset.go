package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

func (c *Controller) GetAsset(ctx context.Context, wAlias, pAlias, iID string) (Asset, error) {
	_, _, aPublic, err := c.accessibilityCheck(ctx, wAlias, pAlias, "")
	if err != nil {
		return Asset{}, err
	}

	if !aPublic {
		return Asset{}, rerror.ErrNotFound
	}

	iid, err := id.AssetIDFrom(iID)
	if err != nil {
		return Asset{}, rerror.ErrNotFound
	}

	a, err := c.usecases.Asset.FindByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Asset{}, rerror.ErrNotFound
		}
		return Asset{}, err
	}

	f, err := c.usecases.Asset.FindFileByID(ctx, iid, nil)
	if err != nil {
		return Asset{}, err
	}

	return NewAsset(a, f), nil
}

func (c *Controller) GetAssets(ctx context.Context,  wAlias, pAlias string, p ListParam) (ListResult[Asset], error) {
	prj, _, aPublic, err := c.accessibilityCheck(ctx, wAlias, pAlias, "")
	if err != nil {
		return ListResult[Asset]{}, err
	}

	if !aPublic {
		return ListResult[Asset]{}, rerror.ErrNotFound
	}

	al, pi, err := c.usecases.Asset.Search(ctx, prj.ID(), interfaces.AssetFilter{
		Sort:       nil,
		Keyword:    nil,
		Pagination: p.Pagination,
	}, nil)

	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ListResult[Asset]{}, rerror.ErrNotFound
		}
		return ListResult[Asset]{}, err
	}

	fileMap, err := c.usecases.Asset.FindFilesByIDs(ctx, al.IDs(), nil)
	if err != nil {
		return ListResult[Asset]{}, err
	}

	return NewListResult(util.Map(al, func(a *asset.Asset) Asset {
		return NewAsset(a, fileMap[a.ID()])
	}), pi, p.Pagination), nil
}
