package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/thread"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) ItemCommentList(ctx context.Context, request ItemCommentListRequestObject) (ItemCommentListResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCommentList404Response{}, err
		}
		return ItemCommentList400Response{}, err
	}

	thId := i.Value().Thread()
	if thId == nil {
		return ItemCommentList200JSONResponse{}, nil
	}
	th, err := uc.Thread.FindByID(ctx, *thId, op)
	if err != nil {
		return ItemCommentList400Response{}, err
	}

	comments := lo.Map(th.Comments(), func(c *thread.Comment, _ int) integrationapi.Comment {
		return *integrationapi.NewComment(c)
	})

	return ItemCommentList200JSONResponse{Comments: &comments}, nil
}

func (s *Server) ItemCommentCreate(ctx context.Context, request ItemCommentCreateRequestObject) (ItemCommentCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCommentCreate404Response{}, err
		}
		return ItemCommentCreate400Response{}, err
	}

	var comment *thread.Comment
	if i.Value().Thread() == nil {
		comment, err = s.createThreadForItem(ctx, uc, i.Value(), *request.Body.Content, op)
	} else {
		_, comment, err = uc.Thread.AddComment(ctx, *i.Value().Thread(), *request.Body.Content, op)
	}

	if err != nil {
		return ItemCommentCreate400Response{}, err
	}

	return ItemCommentCreate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) createThreadForItem(ctx context.Context, uc *interfaces.Container, i *item.Item, content string, op *usecase.Operator) (*thread.Comment, error) {
	idOrAlias := project.IDOrAlias(i.Project().String())
	p, err := uc.Project.FindByIDOrAlias(ctx, idOrAlias, op)
	if err != nil {
		return nil, err
	}
	_, comment, err := uc.Thread.CreateThreadWithComment(ctx, interfaces.CreateThreadWithCommentInput{
		WorkspaceID:  p.Workspace(),
		ResourceID:   i.ID().String(),
		ResourceType: interfaces.ResourceTypeItem,
		Content:      content,
	}, op)
	if err != nil {
		return nil, err
	}
	return comment, nil
}

func (s *Server) ItemCommentUpdate(ctx context.Context, request ItemCommentUpdateRequestObject) (ItemCommentUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCommentUpdate404Response{}, err
		}
		return ItemCommentUpdate400Response{}, err
	}

	thId := i.Value().Thread()
	if thId == nil {
		return ItemCommentUpdate400Response{}, nil
	}
	_, comment, err := uc.Thread.UpdateComment(ctx, *thId, request.CommentId, *request.Body.Content, op)
	if err != nil {
		return ItemCommentUpdate400Response{}, err
	}

	return ItemCommentUpdate200JSONResponse(*integrationapi.NewComment(comment)), nil
}

func (s *Server) ItemCommentDelete(ctx context.Context, request ItemCommentDeleteRequestObject) (ItemCommentDeleteResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	i, err := uc.Item.FindByID(ctx, request.ItemId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ItemCommentDelete404Response{}, err
		}
		return ItemCommentDelete400Response{}, err
	}

	thId := i.Value().Thread()
	if thId == nil {
		return ItemCommentDelete400Response{}, nil
	}
	_, err = uc.Thread.DeleteComment(ctx, *thId, request.CommentId, op)
	if err != nil {
		return ItemCommentDelete400Response{}, err
	}

	return ItemCommentDelete200JSONResponse{Id: &request.CommentId}, nil
}
