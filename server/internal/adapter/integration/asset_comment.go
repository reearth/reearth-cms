package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) AssetCommentList(ctx context.Context, req AssetCommentListRequestObject) (AssetCommentListResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentList404Response{}, err
		}
		return AssetCommentList400Response{}, err
	}

	a, err := uc.Asset.FindByID(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentList404Response{}, err
		}
		return AssetCommentList400Response{}, err
	}

	threadID := a.Thread()
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

func (s *Server) AssetCommentCreate(ctx context.Context, req AssetCommentCreateRequestObject) (AssetCommentCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentCreate404Response{}, err
		}
		return AssetCommentCreate400Response{}, err
	}

	a, err := uc.Asset.FindByID(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentCreate404Response{}, err
		}
		return AssetCommentCreate400Response{}, err
	}

	var comment *thread.Comment
	if a.Thread() == nil {
		comment, err = s.createThreadForAsset(ctx, uc, a, *req.Body.Content, op)
	} else {
		_, comment, err = uc.Thread.AddComment(ctx, *a.Thread(), *req.Body.Content, op)
	}

	if err != nil {
		return nil, err
	}

	return AssetCommentCreate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) createThreadForAsset(ctx context.Context, uc *interfaces.Container, a *asset.Asset, content string, op *usecase.Operator) (*thread.Comment, error) {
	pl, err := uc.Project.Fetch(ctx, project.IDList{a.Project()}, op)
	if err != nil {
		return nil, err
	}
	if len(pl) == 0 {
		return nil, rerror.ErrNotFound
	}
	p := pl[0]
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

func (s *Server) AssetCommentUpdate(ctx context.Context, req AssetCommentUpdateRequestObject) (AssetCommentUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentUpdate404Response{}, err
		}
		return AssetCommentUpdate400Response{}, err
	}

	a, err := uc.Asset.FindByID(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentUpdate404Response{}, err
		}
		return AssetCommentUpdate400Response{}, err
	}

	threadID := a.Thread()
	if threadID == nil {
		return AssetCommentUpdate400Response{}, nil
	}
	_, comment, err := uc.Thread.UpdateComment(ctx, *threadID, req.CommentId, *req.Body.Content, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentUpdate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) AssetCommentDelete(ctx context.Context, req AssetCommentDeleteRequestObject) (AssetCommentDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	_, err := s.loadWPContext(ctx, req.WorkspaceIdOrAlias, req.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentDelete404Response{}, err
		}
		return AssetCommentDelete400Response{}, err
	}

	a, err := uc.Asset.FindByID(ctx, req.AssetId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return AssetCommentDelete404Response{}, err
		}
		return AssetCommentDelete400Response{}, err
	}

	threadID := a.Thread()
	if threadID == nil {
		return AssetCommentDelete400Response{}, nil
	}
	_, err = uc.Thread.DeleteComment(ctx, *threadID, req.CommentId, op)
	if err != nil {
		return nil, err
	}

	return AssetCommentDelete200JSONResponse{Id: req.CommentId.Ref()}, nil
}
