package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *Resolver) Comment() CommentResolver {
	return &commentResolver{r}
}

type commentResolver struct{ *Resolver }

func (r *commentResolver) Author(ctx context.Context, obj *gqlmodel.Comment) (gqlmodel.Operator, error) {
	switch obj.AuthorType {
	case gqlmodel.OperatorTypeUser:
		return dataloaders(ctx).User.Load(obj.AuthorID)
	case gqlmodel.OperatorTypeIntegration:
		return dataloaders(ctx).Integration.Load(obj.AuthorID)
	default:
		return nil, nil
	}
}
