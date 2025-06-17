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

	if !op.IsReadableWorkspace(request.WorkspaceId) {
		return ProjectFilter404Response{}, rerror.ErrNotFound
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	res, pi, err := uc.Project.FindByWorkspace(ctx, request.WorkspaceId, p, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectFilter404Response{}, err
		}
		return ProjectFilter500Response{}, rerror.ErrInternalBy(err)
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

	if !op.IsReadableWorkspace(request.WorkspaceId) {
		return ProjectGet404Response{}, rerror.ErrNotFound
	}

	idOrAlias := project.IDOrAlias(request.ProjectId.String())
	p, err := uc.Project.FindByIDOrAlias(ctx, idOrAlias, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectGet404Response{}, err
		}
		return ProjectGet500Response{}, rerror.ErrInternalBy(err)
	}

	return ProjectGet200JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectCreate(ctx context.Context, request ProjectCreateRequestObject) (ProjectCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectCreate400Response{}, rerror.ErrInvalidParams
	}

	if !op.IsWritableWorkspace(request.WorkspaceId) {
		return ProjectCreate404Response{}, rerror.ErrNotFound
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		var ok bool
		if roles, ok = fromRequestRoles(*request.Body.RequestRoles); !ok {
			return ProjectCreate400Response{}, rerror.ErrInvalidParams
		}
	}

	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  request.WorkspaceId,
		Name:         request.Body.Name,
		Description:  request.Body.Description,
		License:      request.Body.License,
		Readme:       request.Body.Readme,
		Alias:        request.Body.Alias,
		RequestRoles: roles,
	}, op)
	if err != nil {
		return ProjectCreate500Response{}, rerror.ErrInternalBy(err)
	}

	return ProjectCreate201JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectUpdate(ctx context.Context, request ProjectUpdateRequestObject) (ProjectUpdateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectUpdate400Response{}, rerror.ErrInvalidParams
	}

	if !op.IsWritableWorkspace(request.WorkspaceId) {
		return ProjectUpdate404Response{}, rerror.ErrNotFound
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		var ok bool
		if roles, ok = fromRequestRoles(*request.Body.RequestRoles); !ok {
			return ProjectUpdate400Response{}, rerror.ErrInvalidParams
		}
	}

	var acc *interfaces.UpdateProjectAccessibilityParam
	if request.Body.Accessibility != nil {
		var pub *interfaces.PublicationSettingsParam
		if request.Body.Accessibility.Publication != nil {
			pub = &interfaces.PublicationSettingsParam{
				PublicModels: request.Body.Accessibility.Publication.PublicModels,
				PublicAssets: request.Body.Accessibility.Publication.PublicAssets,
			}
		}
		acc = &interfaces.UpdateProjectAccessibilityParam{
			Visibility:  fromProjectVisibility(request.Body.Accessibility.Visibility),
			Publication: pub,
		}
	}

	p, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:            request.ProjectId,
		Name:          request.Body.Name,
		Description:   request.Body.Description,
		License:       request.Body.License,
		Readme:        request.Body.Readme,
		Alias:         request.Body.Alias,
		Accessibility: acc,
		RequestRoles:  roles,
	}, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectUpdate404Response{}, err
		}
		return ProjectUpdate500Response{}, rerror.ErrInternalBy(err)
	}

	return ProjectUpdate200JSONResponse(integrationapi.NewProject(p)), nil
}

func (s *Server) ProjectDelete(ctx context.Context, request ProjectDeleteRequestObject) (ProjectDeleteResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)

	if request.WorkspaceId.IsEmpty() {
		return ProjectDelete400Response{}, rerror.ErrInvalidParams
	}

	if !op.IsWritableWorkspace(request.WorkspaceId) {
		return ProjectDelete404Response{}, rerror.ErrNotFound
	}

	id := request.ProjectId
	err := uc.Project.Delete(ctx, id, op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectDelete404Response{}, err
		}
		return ProjectDelete500Response{}, rerror.ErrInternalBy(err)
	}

	return ProjectDelete200JSONResponse{
		Id: &id,
	}, nil
}
