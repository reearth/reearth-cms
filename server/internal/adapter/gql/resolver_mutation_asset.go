package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) RemoveAsset(ctx context.Context, input gqlmodel.RemoveAssetInput) (*gqlmodel.RemoveAssetPayload, error) {
	panic("implement me")
}
