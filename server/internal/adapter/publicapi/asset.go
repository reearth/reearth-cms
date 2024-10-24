package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

func (c *Controller) GetAsset(ctx context.Context, prj, i string) (Asset, error) {
	_, err := c.checkProject(ctx, prj)
	if err != nil {
		return Asset{}, err
	}

	iid, err := id.AssetIDFrom(i)
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

	return NewAsset(a, f, c.assetUrlResolver), nil
}

func (c *Controller) GetAssets(ctx context.Context, pKey string, p ListParam) (ListResult[Asset], error) {
	prj, err := c.checkProject(ctx, pKey)
	if err != nil {
		return ListResult[Asset]{}, err
	}

	if prj.Publication().Scope() != project.PublicationScopePublic || !prj.Publication().AssetPublic() {
		return ListResult[Asset]{}, rerror.ErrNotFound
	}

	al, pi, err := c.usecases.Asset.FindByProject(ctx, prj.ID(), interfaces.AssetFilter{
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
		return NewAsset(a, fileMap[a.ID()], c.assetUrlResolver)
	}), pi, p.Pagination), nil
}
