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

	p, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelCreate400Response{}, err
		}
		return ModelCreate400Response{}, err
	}

	input := interfaces.CreateModelParam{
		ProjectId:   p.ID(),
		Name:        request.Body.Name,
		Description: request.Body.Description,
		Key:         request.Body.Key,
		Public:      lo.ToPtr(true),
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

	m, err := uc.Model.FindByID(ctx, request.ModelId, op)
	if err != nil {
		return nil, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, request.ModelId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return ModelGet200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) CopyModel(ctx context.Context, request CopyModelRequestObject) (CopyModelResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	m, err := uc.Model.Copy(ctx, interfaces.CopyModelParam{
		ModelId: request.ModelId,
		Name:    request.Body.Name,
		Key:     request.Body.Key,
	}, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return CopyModel404Response{}, err
		}
		return CopyModel500Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return CopyModel404Response{}, err
		}
		return CopyModel500Response{}, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return CopyModel500Response{}, err
	}

	return CopyModel200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
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

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelGetWithProject404Response{}, nil
		}
		return ModelGetWithProject500Response{}, nil
	}

	return ModelGetWithProject200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelUpdate(ctx context.Context, request ModelUpdateRequestObject) (ModelUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	input := interfaces.UpdateModelParam{
		ModelID:     request.ModelId,
		Name:        request.Body.Name,
		Description: request.Body.Description,
		Key:         request.Body.Key,
		Public:      nil,
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

	lastModified, err := uc.Item.LastModifiedByModel(ctx, request.ModelId, op)
	if err != nil && !errors.Is(err, rerror.ErrNotFound) {
		return nil, err
	}

	return ModelUpdate200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelUpdateWithProject(ctx context.Context, request ModelUpdateWithProjectRequestObject) (ModelUpdateWithProjectResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelUpdateWithProject400Response{}, err
		}
		return nil, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelUpdateWithProject400Response{}, err
		}
		return ModelUpdateWithProject400Response{}, err
	}

	input := interfaces.UpdateModelParam{
		ModelID:     m.ID(),
		Name:        request.Body.Name,
		Description: request.Body.Description,
		Key:         request.Body.Key,
		Public:      nil,
	}
	m, err = uc.Model.Update(ctx, input, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelUpdateWithProject400Response{}, err
		}
		return ModelUpdateWithProject400Response{}, err
	}

	sp, err := uc.Schema.FindByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	return ModelUpdateWithProject200JSONResponse(integrationapi.NewModel(m, sp, lastModified)), nil
}

func (s *Server) ModelDelete(ctx context.Context, request ModelDeleteRequestObject) (ModelDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	err := uc.Model.Delete(ctx, request.ModelId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDelete400Response{}, err
		}
		return ModelDelete400Response{}, err
	}

	return ModelDelete200JSONResponse{
		Id: request.ModelId.Ref(),
	}, err
}

func (s *Server) ModelDeleteWithProject(ctx context.Context, request ModelDeleteWithProjectRequestObject) (ModelDeleteWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDeleteWithProject400Response{}, err
		}
		return nil, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, prj.ID(), request.ModelIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDeleteWithProject400Response{}, err
		}
		return ModelDeleteWithProject400Response{}, err
	}

	err = uc.Model.Delete(ctx, m.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ModelDeleteWithProject400Response{}, err
		}
		return ModelDeleteWithProject400Response{}, err
	}

	return ModelDeleteWithProject200JSONResponse{
		Id: m.ID().Ref(),
	}, err
}
