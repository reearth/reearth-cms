package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Item() ItemResolver {
	return &itemResolver{r}
}

type itemResolver struct{ *Resolver }

func (i itemResolver) Project(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Project, error) {
	return dataloaders(ctx).Project.Load(obj.ProjectID)
}

func (i itemResolver) Schema(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Schema, error) {
	return dataloaders(ctx).Schema.Load(obj.SchemaID)
}

func (i itemResolver) Thread(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Thread, error) {
	return dataloaders(ctx).Thread.Load(obj.ThreadID)
}

func (i itemResolver) Model(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Model, error) {
	return dataloaders(ctx).Model.Load(obj.ModelID)
}

func (i itemResolver) User(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.User, error) {
	if obj.UserID != nil {
		return dataloaders(ctx).User.Load(*obj.UserID)
	}
	return nil, nil
}

func (i itemResolver) Integration(ctx context.Context, obj *gqlmodel.Item) (*gqlmodel.Integration, error) {
	if obj.IntegrationID != nil {
		return dataloaders(ctx).Integration.Load(*obj.IntegrationID)
	}
	return nil, nil
}

func (i itemResolver) Status(ctx context.Context, obj *gqlmodel.Item) ([]gqlmodel.ItemStatus, error) {
	//TODO implement me
	panic("implement me")
}
