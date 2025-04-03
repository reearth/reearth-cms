package integration

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

func (s *Server) ProjectFilter(ctx context.Context, request ProjectFilterRequestObject) (ProjectFilterResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectFilter400Response{}, rerror.ErrInvalidParams
	}

	if !op.AllReadableWorkspaces().Has(request.WorkspaceId) {
		return ProjectFilter404Response{}, rerror.ErrNotFound
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	res, pi, err := uc.Project.FindByWorkspace(ctx, request.WorkspaceId, p, op)
	if err != nil {
		return ProjectFilter400Response{}, err
	}

	if len(res) == 0 {
		return ProjectFilter200JSONResponse{
			Projects:   nil,
			Page:       lo.ToPtr(Page(*p.Offset)),
			PerPage:    lo.ToPtr(int(p.Offset.Limit)),
			TotalCount: lo.ToPtr(0),
		}, nil
	}

	projects := lo.Map(res, func(p *project.Project, _ int) integrationapi.Project {
		return integrationapi.NewProject(p)
	})

	return ProjectFilter200JSONResponse{
		Projects:   &projects,
		Page:       lo.ToPtr(Page(*p.Offset)),
		PerPage:    lo.ToPtr(int(p.Offset.Limit)),
		TotalCount: lo.ToPtr(int(pi.TotalCount)),
	}, nil
}

func (s *Server) ProjectGet(ctx context.Context, request ProjectGetRequestObject) (ProjectGetResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectGet400Response{}, rerror.ErrInvalidParams
	}

	if !op.AllReadableWorkspaces().Has(request.WorkspaceId) {
		return ProjectGet404Response{}, rerror.ErrNotFound
	}

	idOrAlias := project.IDOrAlias(request.ProjectId.String())
	p, err := uc.Project.FindByIDOrAlias(ctx, idOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectGet404Response{}, err
		}
		return ProjectGet400Response{}, err
	}

	return ProjectGet200JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectCreate(ctx context.Context, request ProjectCreateRequestObject) (ProjectCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectCreate400Response{}, rerror.ErrInvalidParams
	}

	if !op.AllWritableWorkspaces().Has(request.WorkspaceId) {
		return ProjectCreate404Response{}, rerror.ErrNotFound
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		roles = lo.FilterMap(*request.Body.RequestRoles, func(r integrationapi.ProjectRequestRole, _ int) (workspace.Role, bool) {
			res := fromRequestRole(r)
			return *res, res != nil
		})
	}

	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  request.WorkspaceId,
		Name:         request.Body.Name,
		Description:  request.Body.Description,
		Alias:        request.Body.Alias,
		RequestRoles: roles,
	}, op)
	if err != nil {
		return ProjectCreate400Response{}, err
	}

	return ProjectCreate201JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectUpdate(ctx context.Context, request ProjectUpdateRequestObject) (ProjectUpdateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectUpdate400Response{}, rerror.ErrInvalidParams
	}

	if !op.AllWritableWorkspaces().Has(request.WorkspaceId) {
		return ProjectUpdate404Response{}, rerror.ErrNotFound
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		roles = lo.FilterMap(*request.Body.RequestRoles, func(r integrationapi.ProjectRequestRole, _ int) (workspace.Role, bool) {
			res := fromRequestRole(r)
			return *res, res != nil
		})
	}

	var pub *interfaces.UpdateProjectPublicationParam
	if request.Body.Publication != nil {
		var scope *project.PublicationScope
		if request.Body.Publication.Scope != nil {
			scope = fromProjectPublicationScope(request.Body.Publication.Scope)
		}
		pub = &interfaces.UpdateProjectPublicationParam{
			Scope:       scope,
			AssetPublic: request.Body.Publication.AssetPublic,
		}
	}

	p, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:           request.ProjectId,
		Name:         request.Body.Name,
		Description:  request.Body.Description,
		Alias:        request.Body.Alias,
		Publication:  pub,
		RequestRoles: roles,
	}, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectUpdate404Response{}, err
		}
		return ProjectUpdate400Response{}, err
	}

	return ProjectUpdate200JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectDelete(ctx context.Context, request ProjectDeleteRequestObject) (ProjectDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectDelete400Response{}, rerror.ErrInvalidParams
	}

	if !op.AllWritableWorkspaces().Has(request.WorkspaceId) {
		return ProjectDelete404Response{}, rerror.ErrNotFound
	}

	id := request.ProjectId
	err := uc.Project.Delete(ctx, id, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectDelete404Response{}, err
		}
		return ProjectDelete400Response{}, err
	}

	return ProjectDelete200JSONResponse{
		Id: &id,
	}, nil
}
