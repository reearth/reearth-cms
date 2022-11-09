package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	pid, err := gqlmodel.ToID[id.Project](input.ProjectID)
	if err != nil {
		return nil, err
	}
	uc := usecases(ctx).Asset
	res, err := uc.Create(ctx, interfaces.CreateAssetParam{
		ProjectID: pid,
		File:      gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetPayload{
		Asset: gqlmodel.ToAsset(res, uc.GetURL),
	}, nil
}

func (r *mutationResolver) UpdateAsset(ctx context.Context, input gqlmodel.UpdateAssetInput) (*gqlmodel.UpdateAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.ID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Asset
	res, err2 := uc.Update(ctx, interfaces.UpdateAssetParam{
		AssetID:     aid,
		PreviewType: gqlmodel.FromPreviewType(input.PreviewType),
	}, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.UpdateAssetPayload{
		Asset: gqlmodel.ToAsset(res, uc.GetURL),
	}, nil
}

func (r *mutationResolver) DeleteAsset(ctx context.Context, input gqlmodel.DeleteAssetInput) (*gqlmodel.DeleteAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	res, err2 := usecases(ctx).Asset.Delete(ctx, aid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.DeleteAssetPayload{AssetID: gqlmodel.IDFrom(res)}, nil
}
