package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/samber/lo"
)

func (r *Resolver) Asset() AssetResolver {
	return &assetResolver{r}
}

type assetResolver struct{ *Resolver }

func (r *assetResolver) CreatedBy(ctx context.Context, obj *gqlmodel.Asset) (gqlmodel.Operator, error) {
	switch obj.CreatedByType {
	case gqlmodel.OperatorTypeUser:
		return dataloaders(ctx).User.Load(obj.CreatedByID)
	case gqlmodel.OperatorTypeIntegration:
		return dataloaders(ctx).Integration.Load(obj.CreatedByID)
	default:
		return nil, nil
	}
}

func (r *assetResolver) Project(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (r *assetResolver) Thread(ctx context.Context, obj *gqlmodel.Asset) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}

func (r *assetResolver) Items(ctx context.Context, obj *gqlmodel.Asset) ([]*gqlmodel.AssetItem, error) {
	res, err := dataloaders(ctx).AssetItems.Load(obj.ID)
	return lo.Map(*res, func(i gqlmodel.AssetItem, _ int) *gqlmodel.AssetItem {
		return &i
	}), err
}
