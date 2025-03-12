package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) AssetCommentList(ctx context.Context, request AssetCommentListRequestObject) (AssetCommentListResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	aID := id.AssetID(request.AssetId)

	asset, err := uc.Asset.FindByID(ctx, aID, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentList404Response{}, err
		}
		return AssetCommentList400Response{}, err
	}

	threadID := asset.Thread()
	var comments []integrationapi.Comment
	if threadID == nil {
		return AssetCommentList200JSONResponse{Comments: &comments}, nil
	}
	th, err := uc.Thread.FindByID(ctx, *threadID, op)
	if err != nil {
		return nil, err
	}

	comments = lo.Map(th.Comments(), func(c *thread.Comment, _ int) integrationapi.Comment {
		return *integrationapi.NewComment(c)
	})

	return AssetCommentList200JSONResponse{Comments: &comments}, nil
}

func (s *Server) AssetCommentCreate(ctx context.Context, request AssetCommentCreateRequestObject) (AssetCommentCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	a, err := uc.Asset.FindByID(ctx, request.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentCreate404Response{}, err
		}
		return AssetCommentCreate400Response{}, err
	}

	var comment *thread.Comment
	if a.Thread() == nil {
		comment, err = s.createThreadForAsset(ctx, uc, a, *request.Body.Content, op)
	} else {
		_, comment, err = uc.Thread.AddComment(ctx, *a.Thread(), *request.Body.Content, op)
	}

	if err != nil {
		return nil, err
	}

	return AssetCommentCreate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) createThreadForAsset(ctx context.Context, uc *interfaces.Container, a *asset.Asset, content string, op *usecase.Operator) (*thread.Comment, error) {
	idOrAlias := project.IDOrAlias(a.Project().String())
	p, err := uc.Project.FindByIDOrAlias(ctx, idOrAlias, op)
	if err != nil {
		return nil, err
	}
	_, comment, err := uc.Thread.CreateThreadWithComment(ctx, interfaces.CreateThreadWithCommentInput{
		WorkspaceID:  p.Workspace(),
		ResourceID:   a.ID().String(),
		ResourceType: interfaces.ResourceTypeAsset,
		Content:      content,
	}, op)
	if err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *Server) AssetCommentUpdate(ctx context.Context, request AssetCommentUpdateRequestObject) (AssetCommentUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	asset, err := uc.Asset.FindByID(ctx, request.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentUpdate404Response{}, err
		}
		return AssetCommentUpdate400Response{}, err
	}

	threadID := asset.Thread()
	if threadID == nil {
		return AssetCommentUpdate400Response{}, nil
	}
	_, comment, err := uc.Thread.UpdateComment(ctx, *threadID, request.CommentId, *request.Body.Content, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentUpdate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) AssetCommentDelete(ctx context.Context, request AssetCommentDeleteRequestObject) (AssetCommentDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	asset, err := uc.Asset.FindByID(ctx, request.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentDelete404Response{}, err
		}
		return AssetCommentDelete400Response{}, err
	}

	threadID := asset.Thread()
	if threadID == nil {
		return AssetCommentDelete400Response{}, nil
	}
	_, err = uc.Thread.DeleteComment(ctx, *threadID, request.CommentId, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentDelete200JSONResponse{Id: request.CommentId.Ref()}, nil
}
