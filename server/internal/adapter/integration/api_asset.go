package integration

import (
	"context"
	"mime/multipart"

	"github.com/deepmap/oapi-codegen/pkg/types"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func (s Server) AssetFilter(ctx context.Context, request AssetFilterRequestObject) (AssetFilterResponseObject, error) {
	// TODO implement me
	panic("implement me")
}

func (s Server) AssetCreate(ctx context.Context, request AssetCreateRequestObject) (AssetCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	f, err := ToFile(request.Body)
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
	aa, err := ToAsset(a)
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
	aa, err := ToAsset(a)
	if err != nil {
		return AssetGet400Response{}, err
	}
	return AssetGet200JSONResponse(*aa), nil
}

func ToFile(body *multipart.Reader) (*file.File, error) {
	return nil, nil
}

func ToAsset(a *asset.Asset) (*Asset, error) {
	return &Asset{
		ContentType: nil,
		CreatedAt:   &types.Date{Time: a.CreatedAt()},
		File:        nil,
		Id:          nil,
		Name:        nil,
		PreviewType: nil,
		ProjectId:   nil,
		TotalSize:   nil,
		UpdatedAt:   nil,
	}, nil
}
