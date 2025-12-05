package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) ModelFilter(ctx context.Context, request ModelFilterRequestObject) (ModelFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelFilter404Response{}, err
		}
		return ModelFilter400Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	ml, pi, err := uc.Model.FindByProjectAndKeyword(ctx, interfaces.FindByProjectAndKeywordParam{
		ProjectID:  wp.Project.ID(),
		Keyword:    request.Params.Keyword,
		Sort:       toModelSort(request.Params.Sort, request.Params.Dir),
		Pagination: p,
	}, op)
	if err != nil {
		return nil, err
	}

	models := make([]integrationapi.Model, 0, len(ml))
	for _, m := range ml {
		sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
		if err != nil {
			return nil, err
		}
		lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		models = append(models, integrationapi.NewModel(m, sp, lastModified))
	}

	return ModelFilter200JSONResponse{
		Models:     &models,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) ModelCreate(ctx context.Context, request ModelCreateRequestObject) (ModelCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCreate400Response{}, err
		}
		return ModelCreate400Response{}, err
	}

	input := interfaces.CreateModelParam{
		ProjectId:   wp.Project.ID(),
		Name:        request.Body.Name,
		Description: request.Body.Description,
		Key:         request.Body.Key,
	}
	m, err := uc.Model.Create(ctx, input, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCreate400Response{}, err
		}
		return ModelCreate400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return ModelCreate200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelGet(ctx context.Context, request ModelGetRequestObject) (ModelGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelGet404Response{}, err
		}
		return ModelGet500Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, wp.Model.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, wp.Model.ID(), op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return ModelGet200JSONResponse(integrationapi.NewModel(wp.Model, sp, lastModified)), nil
}

func (s *Server) ModelCopy(ctx context.Context, request ModelCopyRequestObject) (ModelCopyResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCopy404Response{}, err
		}
		return ModelCopy500Response{}, err
	}

	m, err := uc.Model.Copy(ctx, interfaces.CopyModelParam{
		ModelId: wp.Model.ID(),
		Name:    request.Body.Name,
		Key:     request.Body.Key,
	}, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCopy404Response{}, err
		}
		return ModelCopy500Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCopy404Response{}, err
		}
		return ModelCopy500Response{}, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return ModelCopy500Response{}, err
	}

	return ModelCopy200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelUpdate(ctx context.Context, request ModelUpdateRequestObject) (ModelUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelUpdate400Response{}, err
		}
		return ModelUpdate400Response{}, err
	}

	input := interfaces.UpdateModelParam{
		ModelID:     wp.Model.ID(),
		Name:        request.Body.Name,
		Description: request.Body.Description,
		Key:         request.Body.Key,
	}
	m, err := uc.Model.Update(ctx, input, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelUpdate400Response{}, err
		}
		return ModelUpdate400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, wp.Model.ID(), op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return ModelUpdate200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelDelete(ctx context.Context, request ModelDeleteRequestObject) (ModelDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, &request.ModelIdOrKey)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDelete400Response{}, err
		}
		return ModelDelete400Response{}, err
	}

	err = uc.Model.Delete(ctx, wp.Model.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDelete400Response{}, err
		}
		return ModelDelete400Response{}, err
	}

	return ModelDelete200JSONResponse{
		Id: wp.Model.ID(),
	}, err
}
