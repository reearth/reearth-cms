package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	res, err := usecases(ctx).Asset.Create(ctx, interfaces.CreateAssetParam{
		File:   gqlmodel.FromFile(&input.File),
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateAssetPayload{Asset: gqlmodel.ToAsset(res)}, nil
}

func (r *mutationResolver) RemoveAsset(ctx context.Context, input gqlmodel.RemoveAssetInput) (*gqlmodel.RemoveAssetPayload, error) {
	aid, err := gqlmodel.ToID[id.Asset](input.AssetID)
	if err != nil {
		return nil, err
	}

	res, err2 := usecases(ctx).Asset.Remove(ctx, aid, getOperator(ctx))
	if err2 != nil {
		return nil, err2
	}

	return &gqlmodel.RemoveAssetPayload{AssetID: gqlmodel.IDFrom(res)}, nil
}

func (r *mutationResolver) CreateAssetFile(ctx context.Context, input gqlmodel.CreateAssetFileInput) (*gqlmodel.CreateAssetFilePayload, error) {
	// TODO implement me
	panic("implement me")}

func (r *mutationResolver) RemoveAssetFile(ctx context.Context, input gqlmodel.RemoveAssetFileInput) (*gqlmodel.RemoveAssetFilePayload, error) {
	// TODO implement me
	panic("implement me")
}
