package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/group"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) GroupFilter(ctx context.Context, request GroupFilterRequestObject) (GroupFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupFilter404Response{}, err
		}
		return GroupFilter500Response{}, err
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	sort := toGroupSort(request.Params.Sort, request.Params.Dir)
	gl, pi, err := uc.Group.Filter(ctx, wp.Project.ID(), sort, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupFilter404Response{}, err
		}
		return GroupFilter500Response{}, err
	}

	gIDs := lo.Map(gl, func(g *group.Group, _ int) id.GroupID {
		return g.ID()
	})

	schemas, err := uc.Schema.FindByGroups(ctx, gIDs, op)
	if err != nil {
		return GroupFilter500Response{}, err
	}

	schemaMap := lo.Associate(schemas, func(s *schema.Schema) (id.SchemaID, *schema.Schema) {
		return s.ID(), s
	})

	groups := lo.Map(gl, func(g *group.Group, _ int) integrationapi.Group {
		sID := g.Schema()
		var ss *schema.Schema
		if !sID.IsEmpty() {
			ss = schemaMap[sID]
		}
		return integrationapi.NewGroup(g, ss)
	})

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

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupCreate400Response{}, err
		}
		return GroupCreate500Response{}, err
	}

	input := interfaces.CreateGroupParam{
		ProjectId:   wp.Project.ID(),
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

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGet404Response{}, err
		}
		return GroupGet500Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, wp.Project.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupGet404Response{}, err
		}
		return GroupGet500Response{}, err
	}

	gs, err := uc.Schema.FindByGroup(ctx, g.ID(), op)
	if err != nil {
		return GroupGet500Response{}, err
	}

	return GroupGet200JSONResponse(integrationapi.NewGroup(g, gs)), nil
}

func (s *Server) GroupUpdate(ctx context.Context, request GroupUpdateRequestObject) (GroupUpdateResponseObject, error) {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdate404Response{}, err
		}
		return GroupUpdate400Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, wp.Project.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupUpdate404Response{}, err
		}
		return GroupUpdate400Response{}, err
	}

	input := interfaces.UpdateGroupParam{
		GroupID:     g.ID(),
		Name:        request.Body.Name,
		Key:         request.Body.Key,
		Description: request.Body.Description,
	}
	g, err = uc.Group.Update(ctx, input, op)
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

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDelete404Response{}, err
		}
		return GroupDelete400Response{}, err
	}

	g, err := uc.Group.FindByIDOrKey(ctx, wp.Project.ID(), request.GroupIdOrKey, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDelete404Response{}, err
		}
		return GroupDelete400Response{}, err
	}

	err = uc.Group.Delete(ctx, g.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return GroupDelete404Response{}, err
		}
		return GroupDelete400Response{}, err
	}

	return GroupDelete200JSONResponse{
		Id: g.ID().Ref(),
	}, nil
}
