package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateRequest(ctx context.Context, input gqlmodel.CreateRequestInput) (*gqlmodel.RequestPayload, error) {
	//TODO implement me
	panic("implement me")
}

func (r *mutationResolver) UpdateRequest(ctx context.Context, input gqlmodel.UpdateRequestInput) (*gqlmodel.RequestPayload, error) {
	//TODO implement me
	panic("implement me")
}

func (r *mutationResolver) ApproveRequest(ctx context.Context, input gqlmodel.ApproveRequestInput) (*gqlmodel.RequestPayload, error) {
	//TODO implement me
	panic("implement me")
}

func (r *mutationResolver) DeleteRequest(ctx context.Context, input gqlmodel.DeleteRequestInput) (*gqlmodel.DeleteRequestPayload, error) {
	//TODO implement me
	panic("implement me")
}
