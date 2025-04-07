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
		return nil, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	gs, pi, err := uc.Group.FindByProject(ctx, prj.ID(), p, op)
	if err != nil {
		return nil, err
	}

	groups := make([]integrationapi.Group, 0, len(gs))
	for _, g := range gs {
		ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
		if err != nil {
			return nil, err
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

func (s *Server) CreateGroup(ctx context.Context, request CreateGroupRequestObject) (CreateGroupResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return CreateGroup400Response{}, err
		}
		return nil, err
	}

	input := interfaces.CreateGroupParam{
		ProjectId:   prj.ID(),
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err := uc.Group.Create(ctx, input, op)
	if err != nil {
		if errors.Is(err, interfaces.ErrGroupKeyConflict) {
			return CreateGroup409Response{}, err
		}
		return CreateGroup400Response{}, err
	}
	ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return nil, err
	}

	return CreateGroup201JSONResponse(integrationapi.NewGroup(g, ss)), nil
}

func (s *Server) GroupGet(ctx context.Context, request GroupGetRequestObject) (GroupGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	g, err := uc.Group.FindByID(ctx, request.GroupId, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGet404Response{}, err
		}
		return nil, err
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
		if errors.Is(err, interfaces.ErrGroupKeyConflict) {
			return GroupUpdate409Response{}, err
		}
		return GroupUpdate400Response{}, err
	}
	ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return nil, err
	}

	return GroupUpdate200JSONResponse(integrationapi.NewGroup(g, ss)), nil
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
		return nil, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGetWithProject404Response{}, err
		}
		return nil, err
	}
	ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return nil, err
	}

	return GroupGetWithProject200JSONResponse(integrationapi.NewGroup(g, ss)), nil
}

func (s *Server) GroupUpdateWithProject(ctx context.Context, request GroupUpdateWithProjectRequestObject) (GroupUpdateWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdateWithProject404Response{}, err
		}
		return nil, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdateWithProject404Response{}, err
		}
		return nil, err
	}

	input := interfaces.UpdateGroupParam{
		GroupID:     g.ID(),
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err = uc.Group.Update(ctx, input, op)
	if err != nil {
		if errors.Is(err, interfaces.ErrGroupKeyConflict) {
			return GroupUpdateWithProject409Response{}, err
		}
		return GroupUpdateWithProject400Response{}, err
	}
	ss, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return nil, err
	}

	return GroupUpdateWithProject200JSONResponse(integrationapi.NewGroup(g, ss)), nil
}

func (s *Server) GroupDeleteWithProject(ctx context.Context, request GroupDeleteWithProjectRequestObject) (GroupDeleteWithProjectResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	prj, err := uc.Project.FindByIDOrAlias(ctx, request.ProjectIdOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDeleteWithProject404Response{}, err
		}
		return nil, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, prj.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDeleteWithProject404Response{}, err
		}
		return nil, err
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
