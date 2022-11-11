package integration

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/samber/lo"
)

func (s Server) AssetCommentList(ctx context.Context, request AssetCommentListRequestObject) (AssetCommentListResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	aID := id.AssetID(request.AssetId)

	asset, err := uc.Asset.FindByID(ctx, aID, op)
	if err != nil {
		return AssetCommentList400Response{}, err
	}

	threadID := asset.Thread()
	th, err := uc.Thread.FindByID(ctx, threadID, op)
	if err != nil {
		return nil, err
	}

	comments := lo.Map(th.Comments(), func(c *thread.Comment, _ int) integrationapi.Comment {
		return *integrationapi.ToComment(c)
	})

	return AssetCommentList200JSONResponse{Comments: &comments}, nil
}

func (s Server) AssetCommentCreate(ctx context.Context, request AssetCommentCreateRequestObject) (AssetCommentCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	aID := id.AssetID(request.AssetId)

	asset, err := uc.Asset.FindByID(ctx, aID, op)
	if err != nil {
		return AssetCommentCreate400Response{}, err
	}

	threadID := asset.Thread()
	_, comment, err := uc.Thread.AddComment(ctx, threadID, *request.Body.Content, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentCreate200JSONResponse(*integrationapi.ToComment(comment)), nil
}

func (s Server) AssetCommentUpdate(ctx context.Context, request AssetCommentUpdateRequestObject) (AssetCommentUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	aID := id.AssetID(request.AssetId)
	cID := id.CommentID(request.CommentId)

	asset, err := uc.Asset.FindByID(ctx, aID, op)
	if err != nil {
		return AssetCommentUpdate400Response{}, err
	}

	threadID := asset.Thread()
	_, comment, err := uc.Thread.UpdateComment(ctx, threadID, cID, *request.Body.Content, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentUpdate200JSONResponse(*integrationapi.ToComment(comment)), nil
}

func (s Server) AssetCommentDelete(ctx context.Context, request AssetCommentDeleteRequestObject) (AssetCommentDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	aID := id.AssetID(request.AssetId)
	cID := id.CommentID(request.CommentId)

	asset, err := uc.Asset.FindByID(ctx, aID, op)
	if err != nil {
		return AssetCommentDelete400Response{}, err
	}

	threadID := asset.Thread()
	_, err = uc.Thread.DeleteComment(ctx, threadID, cID, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentDelete200JSONResponse{Id: cID.Ref()}, nil
}
