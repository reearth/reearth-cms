package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.User, error) {
	return dataloaders(ctx).User.Load(obj.CreatedByID)
}

func (r *assetResolver) Project(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (r *assetResolver) Thread(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}
