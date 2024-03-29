package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) ModelFilter(ctx context.Context, request ModelFilterRequestObject) (ModelFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelFilter404Response{}, err
		}
		return nil, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	ms, pi, err := uc.Model.FindByProject(ctx, prj.ID(), p, op)
	if err != nil {
		return nil, err
	}

	models := make([]integrationapi.Model, 0, len(ms))
	for _, m := range ms {
		lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
		if err != nil && !errors.Is(err, rerror.ErrNotFound) {
			return nil, err
		}
		models = append(models, integrationapi.NewModel(m, lastModified))
	}

	return ModelFilter200JSONResponse{
		Models:     &models,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) ModelGet(ctx context.Context, request ModelGetRequestObject) (ModelGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, request.ModelId, op)
	if err != nil {
		return nil, err
	}

	return ModelGet200JSONResponse(integrationapi.NewModel(m, lastModified)), err
}

func (s *Server) ModelGetWithProject(ctx context.Context, request ModelGetWithProjectRequestObject) (ModelGetWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelGetWithProject404Response{}, nil
		}
		return ModelGetWithProject500Response{}, nil
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelGetWithProject404Response{}, nil
		}
		return ModelGetWithProject500Response{}, nil
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelGetWithProject404Response{}, nil
		}
		return ModelGetWithProject500Response{}, nil
	}

	return ModelGetWithProject200JSONResponse(integrationapi.NewModel(m, lastModified)), nil
}
