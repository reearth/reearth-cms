package gql

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.70

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/samber/lo"
)

// Author is the resolver for the author field.
func (r *commentResolver) Author(ctx context.Context, obj *gqlmodel.Comment) (gqlmodel.Operator, error) {
	switch obj.AuthorType {
	case gqlmodel.OperatorTypeUser:
		ws, err := loaders(ctx).Workspace.FindByUser(ctx, obj.AuthorID)
		if err != nil {
			return nil, err
		}
		ok := lo.ContainsBy(ws, func(w *gqlmodel.Workspace) bool {
			return w != nil && (w.ID == obj.WorkspaceID)
		})
		if !ok {
			return nil, nil
		}
		return dataloaders(ctx).User.Load(obj.AuthorID)
	case gqlmodel.OperatorTypeIntegration:
		return dataloaders(ctx).Integration.Load(obj.AuthorID)
	default:
		return nil, nil
	}
}

// CreateThreadWithComment is the resolver for the createThreadWithComment field.
func (r *mutationResolver) CreateThreadWithComment(ctx context.Context, input gqlmodel.CreateThreadWithCommentInput) (*gqlmodel.CommentPayload, error) {
	wid, err := gqlmodel.ToID[accountdomain.Workspace](input.WorkspaceID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Thread
	rt, ok := gqlmodel.FromResourceType(input.ResourceType)
	if !ok {
		return nil, errors.New("invalid resource type")
	}
	th, c, err := uc.CreateThreadWithComment(ctx, interfaces.CreateThreadWithCommentInput{
		WorkspaceID:  wid,
		ResourceID:   (string)(input.ResourceID),
		ResourceType: rt,
		Content:      input.Content,
	}, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CommentPayload{
		Thread:  gqlmodel.ToThread(th),
		Comment: gqlmodel.ToComment(c, th),
	}, nil
}

// AddComment is the resolver for the addComment field.
func (r *mutationResolver) AddComment(ctx context.Context, input gqlmodel.AddCommentInput) (*gqlmodel.CommentPayload, error) {
	thid := lo.Must(gqlmodel.ToID[id.Thread](input.ThreadID))

	uc := usecases(ctx).Thread
	th, c, err := uc.AddComment(ctx, thid, input.Content, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CommentPayload{
		Thread:  gqlmodel.ToThread(th),
		Comment: gqlmodel.ToComment(c, th),
	}, nil
}

// UpdateComment is the resolver for the updateComment field.
func (r *mutationResolver) UpdateComment(ctx context.Context, input gqlmodel.UpdateCommentInput) (*gqlmodel.CommentPayload, error) {
	thid, err := gqlmodel.ToID[id.Thread](input.ThreadID)
	if err != nil {
		return nil, err
	}

	cid, err := gqlmodel.ToID[id.Comment](input.CommentID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Thread
	th, c, err := uc.UpdateComment(ctx, thid, cid, input.Content, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.CommentPayload{
		Thread:  gqlmodel.ToThread(th),
		Comment: gqlmodel.ToComment(c, th),
	}, nil
}

// DeleteComment is the resolver for the deleteComment field.
func (r *mutationResolver) DeleteComment(ctx context.Context, input gqlmodel.DeleteCommentInput) (*gqlmodel.DeleteCommentPayload, error) {
	thid, err := gqlmodel.ToID[id.Thread](input.ThreadID)
	if err != nil {
		return nil, err
	}

	cid, err := gqlmodel.ToID[id.Comment](input.CommentID)
	if err != nil {
		return nil, err
	}

	uc := usecases(ctx).Thread
	th, err := uc.DeleteComment(ctx, thid, cid, getOperator(ctx))
	if err != nil {
		return nil, err
	}

	return &gqlmodel.DeleteCommentPayload{
		Thread:    gqlmodel.ToThread(th),
		CommentID: gqlmodel.IDFrom(cid),
	}, nil
}

// Workspace is the resolver for the workspace field.
func (r *threadResolver) Workspace(ctx context.Context, obj *gqlmodel.Thread) (*gqlmodel.Workspace, error) {
	return dataloaders(ctx).Workspace.Load(obj.WorkspaceID)
}

// Comment returns CommentResolver implementation.
func (r *Resolver) Comment() CommentResolver { return &commentResolver{r} }

// Thread returns ThreadResolver implementation.
func (r *Resolver) Thread() ThreadResolver { return &threadResolver{r} }

type commentResolver struct{ *Resolver }
type threadResolver struct{ *Resolver }
