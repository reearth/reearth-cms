package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
)

func (r *mutationResolver) CreateComment(ctx context.Context, input gqlmodel.CreateCommentInput) (*gqlmodel.CreateCommentPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) DeleteComment(ctx context.Context, input gqlmodel.DeleteCommentInput) (*gqlmodel.DeleteCommentPayload, error) {
	panic("implement me")
}

func (r *mutationResolver) UpdateComment(ctx context.Context, input gqlmodel.UpdateCommentInput) (*gqlmodel.UpdateCommentPayload, error) {
	panic("implement me")
}
