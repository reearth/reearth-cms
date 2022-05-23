package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateAsset(ctx context.Context, input *gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPyload, error) {
	return &gqlmodel.CreateAssetPyload{
		Asset: &gqlmodel.Asset{
			ID: "hogehoge",
		},
	}, nil
}
