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
	ar := adapter.AcRepos(ctx)

	w, err := ar.Workspace.FindByIDOrAlias(ctx, request.WorkspaceIdOrAlias)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectFilter404Response{}, err
		}
		return ProjectFilter400Response{}, err
	}

	if !op.IsReadableWorkspace(w.ID()) {
		return ProjectFilter404Response{}, rerror.ErrNotFound
	}

	p := fromPagination(request.Params.Page, request.Params.PerPage)
	res, pi, err := uc.Project.FindByWorkspace(ctx, w.ID(), &interfaces.ProjectFilter{
		Pagination: p,
		Sort:       toProjectSort(request.Params.Sort, request.Params.Dir),
		Keyword:    request.Params.Keyword,
	}, op)
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
	op := adapter.Operator(ctx)

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectGet404Response{}, err
		}
		return ProjectGet400Response{}, err
	}

	if !op.IsReadableWorkspace(wp.Workspace.ID()) {
		return ProjectGet404Response{}, rerror.ErrNotFound
	}

	return ProjectGet200JSONResponse(integrationapi.NewProject(&wp.Project)), nil
}

func (s *Server) ProjectCreate(ctx context.Context, request ProjectCreateRequestObject) (ProjectCreateResponseObject, error) {
	uc := adapter.Usecases(ctx)
	op := adapter.Operator(ctx)
	ar := adapter.AcRepos(ctx)

	w, err := ar.Workspace.FindByIDOrAlias(ctx, request.WorkspaceIdOrAlias)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectCreate404Response{}, err
		}
		return ProjectCreate400Response{}, err
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		var ok bool
		if roles, ok = fromRequestRoles(*request.Body.RequestRoles); !ok {
			return ProjectCreate400Response{}, rerror.ErrInvalidParams
		}
	}

	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  w.ID(),
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

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectUpdate404Response{}, err
		}
		return ProjectUpdate400Response{}, err
	}

	if !op.IsWritableWorkspace(wp.Workspace.ID()) {
		return ProjectUpdate404Response{}, rerror.ErrNotFound
	}

	var roles []workspace.Role
	if request.Body.RequestRoles != nil {
		var ok bool
		if roles, ok = fromRequestRoles(*request.Body.RequestRoles); !ok {
			return ProjectUpdate400Response{}, rerror.ErrInvalidParams
		}
	}

	var acc *interfaces.AccessibilityParam
	if request.Body.Accessibility != nil {
		var pub *interfaces.PublicationSettingsParam
		if request.Body.Accessibility.Publication != nil {
			pub = &interfaces.PublicationSettingsParam{
				PublicModels: request.Body.Accessibility.Publication.PublicModels,
				PublicAssets: request.Body.Accessibility.Publication.PublicAssets,
			}
		}
		acc = &interfaces.AccessibilityParam{
			Visibility:  fromProjectVisibility(request.Body.Accessibility.Visibility),
			Publication: pub,
		}
	}

	p, err := uc.Project.Update(ctx, interfaces.UpdateProjectParam{
		ID:            wp.Project.ID(),
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

	wp, err := s.loadWPContext(ctx, request.WorkspaceIdOrAlias, request.ProjectIdOrAlias, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectDelete404Response{}, err
		}
		return ProjectDelete400Response{}, err
	}

	if !op.IsWritableWorkspace(wp.Workspace.ID()) {
		return ProjectDelete404Response{}, rerror.ErrNotFound
	}

	err = uc.Project.Delete(ctx, wp.Project.ID(), op)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return ProjectDelete404Response{}, err
		}
		return ProjectDelete500Response{}, rerror.ErrInternalBy(err)
	}

	return ProjectDelete200JSONResponse{
		Id: wp.Project.ID(),
	}, nil
}
