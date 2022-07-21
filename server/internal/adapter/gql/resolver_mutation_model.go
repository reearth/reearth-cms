package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateModel(ctx context.Context, input gqlmodel.CreateModelInput) (*gqlmodel.ProjectPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) UpdateModel(ctx context.Context, input gqlmodel.UpdateModelInput) (*gqlmodel.ProjectPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) DeleteModel(ctx context.Context, input gqlmodel.DeleteModelInput) (*gqlmodel.DeleteProjectPayload, error) {
	// TODO implement me
	panic("implement me")
}

func (r *mutationResolver) PublishModel(ctx context.Context, input gqlmodel.PublishModelInput) (*gqlmodel.DeleteProjectPayload, error) {
	// TODO implement me
	panic("implement me")
}
