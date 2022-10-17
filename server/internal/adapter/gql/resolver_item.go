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
