package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Schema() SchemaResolver {
	return &schemaResolver{r}
}

type schemaResolver struct{ *Resolver }

func (s schemaResolver) Project(ctx context.Context, obj *gqlmodel.Schema) (*gqlmodel.Project, error) {
	// TODO implement me
	panic("implement me")
}
