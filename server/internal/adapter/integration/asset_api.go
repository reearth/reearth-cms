package integration

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func (s Server) AssetFilter(ctx context.Context, request AssetFilterRequestObject) (AssetFilterResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	var sort asset.SortType
	if request.Params.Sort != nil {
		var err error
		sort, err = asset.SortTypeFromString(string(*request.Params.Sort))
		if err != nil {
			return nil, err
		}
	}

	f := interfaces.AssetFilter{
		Keyword:    nil,
		Sort:       &sort,
		Pagination: toPagination(request.Params.Page, request.Params.PerPage),
	}

	assets, pi, err := uc.Asset.FindByProject(ctx, id.ProjectID(request.ProjectId), f, op)
	if err != nil {
		return AssetFilter400Response{}, err
	}

	itemList, err := util.TryMap(assets, func(a *asset.Asset) (integrationapi.Asset, error) {
		aa, err := toAsset(a, uc.Asset.GetURL(a))
		if err != nil {
			return integrationapi.Asset{}, err
		}
		return *aa, nil
	})
	if err != nil {
		return AssetFilter400Response{}, err
	}

	return AssetFilter200JSONResponse{
		Items:      &itemList,
		Page:       request.Params.Page,
		PerPage:    request.Params.PerPage,
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s Server) AssetCreate(ctx context.Context, request AssetCreateRequestObject) (AssetCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	f, err := toFile(request.Body)
	if err != nil {
		return AssetCreate400Response{}, err
	}

	cp := interfaces.CreateAssetParam{
		ProjectID: id.ProjectID(request.ProjectId),
		File:      f,
	}
	a, err := uc.Asset.Create(ctx, cp, op)
	if err != nil {
		return AssetCreate400Response{}, err
	}
	aa, err := toAsset(a, uc.Asset.GetURL(a))
	if err != nil {
		return AssetCreate400Response{}, err
	}
	return AssetCreate200JSONResponse(*aa), nil
}

func (s Server) AssetDelete(ctx context.Context, request AssetDeleteRequestObject) (AssetDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	aId, err := uc.Asset.Delete(ctx, id.AssetID(request.AssetId), op)
	if err != nil {
		return AssetDelete400Response{}, nil
	}
	return AssetDelete200JSONResponse{
		Id: &aId,
	}, nil
}

func (s Server) AssetGet(ctx context.Context, request AssetGetRequestObject) (AssetGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	a, err := uc.Asset.FindByID(ctx, id.AssetID(request.AssetId), op)
	if err != nil {
		return AssetGet400Response{}, err
	}
	aa, err := toAsset(a, uc.Asset.GetURL(a))
	if err != nil {
		return AssetGet400Response{}, err
	}
	return AssetGet200JSONResponse(*aa), nil
}
