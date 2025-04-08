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

func (s *Server) GroupFilter(ctx context.Context, request GroupFilterRequestObject) (GroupFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupFilter404Response{}, err
		}
		return GroupFilter500Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	gl, pi, err := uc.Group.FindByProject(ctx, prj.ID(), p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupFilter404Response{}, err
		}
		return GroupFilter500Response{}, err
	}
	groups := make([]integrationapi.Group, 0, len(gl))
	for _, g := range gl {
		ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
		if err != nil {
			return GroupFilter500Response{}, err
		}
		groups = append(groups, integrationapi.NewGroup(g, ss))
	}

	return GroupFilter200JSONResponse{
		Groups:     &groups,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) GroupCreate(ctx context.Context, request GroupCreateRequestObject) (GroupCreateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupCreate400Response{}, err
		}
		return GroupCreate500Response{}, err
	}

	input := interfaces.CreateGroupParam{
		ProjectId:   prj.ID(),
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err := uc.Group.Create(ctx, input, op)
	if err != nil {
		return GroupCreate400Response{}, err
	}
	gs, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return GroupCreate500Response{}, err
	}

	return GroupCreate201JSONResponse(integrationapi.NewGroup(g, gs)), nil
}

func (s *Server) GroupGet(ctx context.Context, request GroupGetRequestObject) (GroupGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	g, err := uc.Group.FindByID(ctx, request.GroupId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGet404Response{}, err
		}
		return GroupGet500Response{}, err
	}

	return GroupGet200JSONResponse(integrationapi.NewGroup(g, nil)), nil
}

func (s *Server) GroupUpdate(ctx context.Context, request GroupUpdateRequestObject) (GroupUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	input := interfaces.UpdateGroupParam{
		GroupID:     request.GroupId,
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err := uc.Group.Update(ctx, input, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdate404Response{}, err
		}
		return GroupUpdate400Response{}, err
	}
	gs, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return GroupUpdate500Response{}, err
	}

	return GroupUpdate200JSONResponse(integrationapi.NewGroup(g, gs)), nil
}

func (s *Server) GroupDelete(ctx context.Context, request GroupDeleteRequestObject) (GroupDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	err := uc.Group.Delete(ctx, request.GroupId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDelete404Response{}, err
		}
		return GroupDelete400Response{}, err
	}

	return GroupDelete200JSONResponse{
		Id: request.GroupId.Ref(),
	}, nil
}

func (s *Server) GroupGetWithProject(ctx context.Context, request GroupGetWithProjectRequestObject) (GroupGetWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGetWithProject404Response{}, err
		}
		return GroupGetWithProject500Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGetWithProject404Response{}, err
		}
		return GroupGetWithProject500Response{}, err
	}
	gs, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return GroupGetWithProject500Response{}, err
	}

	return GroupGetWithProject200JSONResponse(integrationapi.NewGroup(g, gs)), nil
}

func (s *Server) GroupUpdateWithProject(ctx context.Context, request GroupUpdateWithProjectRequestObject) (GroupUpdateWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdateWithProject404Response{}, err
		}
		return GroupUpdateWithProject500Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdateWithProject404Response{}, err
		}
		return GroupUpdateWithProject500Response{}, err
	}

	input := interfaces.UpdateGroupParam{
		GroupID:     g.ID(),
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err = uc.Group.Update(ctx, input, op)
	if err != nil {
		return GroupUpdateWithProject400Response{}, err
	}
	gs, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return GroupUpdateWithProject500Response{}, err
	}

	return GroupUpdateWithProject200JSONResponse(integrationapi.NewGroup(g, gs)), nil
}

func (s *Server) GroupDeleteWithProject(ctx context.Context, request GroupDeleteWithProjectRequestObject) (GroupDeleteWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDeleteWithProject404Response{}, err
		}
		return GroupDeleteWithProject500Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDeleteWithProject404Response{}, err
		}
		return GroupDeleteWithProject500Response{}, err
	}

	err = uc.Group.Delete(ctx, g.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDeleteWithProject404Response{}, err
		}
		return GroupDeleteWithProject400Response{}, err
	}

	return GroupDeleteWithProject200JSONResponse{
		Id: g.ID().Ref(),
	}, nil
}
