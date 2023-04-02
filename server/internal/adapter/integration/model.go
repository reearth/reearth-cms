package integration

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
)

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
		return nil, err
	}

	m, err := uc.Model.FindByIDOrKey(ctx, p.ID(), request.ModelIdOrKey, op)
	if err != nil {
		return nil, err
	}

	lastModified, err := uc.Item.LastModifiedByModel(ctx, m.ID(), op)
	if err != nil {
		return nil, err
	}

	return ModelGetWithProject200JSONResponse(integrationapi.NewModel(m, lastModified)), nil
}
