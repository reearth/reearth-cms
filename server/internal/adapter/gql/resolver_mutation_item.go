package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateItem(ctx context.Context, input gqlmodel.CreateItemInput) (*gqlmodel.ItemPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) UpdateItem(ctx context.Context, input gqlmodel.UpdateItemInput) (*gqlmodel.ItemPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) DeleteItem(ctx context.Context, input gqlmodel.DeleteItemInput) (*gqlmodel.DeleteItemPayload, error) {
	// TODO implement me
	panic("implement me")
}
