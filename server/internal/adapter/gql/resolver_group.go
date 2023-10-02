package gql

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Group() GroupResolver {
	return &groupResolver{r}
}

type groupResolver struct{ *Resolver }

func (g groupResolver) Schema(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Schema, error) {
	//TODO
	panic("implement me")
}
func (g groupResolver) Project(ctx context.Context, obj *gqlmodel.Group) (*gqlmodel.Project, error) {
	//TODO
	panic("implement me")
}
