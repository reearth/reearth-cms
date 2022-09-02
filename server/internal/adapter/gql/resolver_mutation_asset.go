package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) DeleteAsset(ctx context.Context, input gqlmodel.DeleteAssetInput) (*gqlmodel.DeleteAssetPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) UpdateAsset(ctx context.Context, input gqlmodel.UpdateAssetInput) (*gqlmodel.UpdateAssetPayload, error) {
	panic("implement me")
}
