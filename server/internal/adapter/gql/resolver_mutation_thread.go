package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/samber/lo"
)

func (r *mutationResolver) CreateThread(ctx context.Context, input gqlmodel.CreateThreadInput) (*gqlmodel.CreateThreadPayload, error) {
	wid := lo.Must(gqlmodel.ToID[id.Workspace](input.WorkspaceID))
	uc := usecases(ctx).Thread
	th, err := uc.CreateThread(ctx, wid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CreateThreadPayload{Thread: gqlmodel.ToThread(th)}, nil
}

func (r *mutationResolver) AddComment(ctx context.Context, input gqlmodel.AddCommentInput) (*gqlmodel.AddCommentPayload, error) {
	thid := lo.Must(gqlmodel.ToID[id.Thread](input.ThreadID))
	author := getOperator(ctx).User
	c := thread.NewComment(id.NewCommentID(), author, input.Content)

	uc := usecases(ctx).Thread
	c, err := uc.AddComment(ctx, thid, c, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.AddCommentPayload{Comment: gqlmodel.ToComment(c)}, nil
}

func (r *mutationResolver) UpdateComment(ctx context.Context, input gqlmodel.UpdateCommentInput) (*gqlmodel.UpdateCommentPayload, error) {
	thid := lo.Must(gqlmodel.ToID[id.Thread](input.ThreadID))
	cid := lo.Must(gqlmodel.ToID[id.Comment](input.CommentID))

	uc := usecases(ctx).Thread
	c, err := uc.UpdateComment(ctx, thid, cid, input.Content, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.UpdateCommentPayload{Comment: gqlmodel.ToComment(c)}, nil
}

func (r *mutationResolver) DeleteComment(ctx context.Context, input gqlmodel.DeleteCommentInput) (*gqlmodel.DeleteCommentPayload, error) {
	thid := lo.Must(gqlmodel.ToID[id.Thread](input.ThreadID))
	cid := lo.Must(gqlmodel.ToID[id.Comment](input.CommentID))

	uc := usecases(ctx).Thread
	if err := uc.DeleteComment(ctx, thid, cid, getOperator(ctx)); err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteCommentPayload{CommentID: gqlmodel.IDFrom(cid)}, nil
}
