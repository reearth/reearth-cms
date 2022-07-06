package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateField(ctx context.Context, input gqlmodel.CreateFieldInput) (*gqlmodel.FieldPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) UpdateField(ctx context.Context, input gqlmodel.UpdateFieldInput) (*gqlmodel.FieldPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) DeleteField(ctx context.Context, input gqlmodel.DeleteFieldInput) (*gqlmodel.DeleteFieldPayload, error) {
	// TODO implement me
	panic("implement me")
}
