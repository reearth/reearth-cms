package integration

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/project"
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
		return nil, err
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
	}, err
}

func (s *Server) ProjectCreate(ctx context.Context, request ProjectCreateRequestObject) (ProjectCreateResponseObject, error) {
	panic("not implemented")
}

func (s *Server) ProjectGet(ctx context.Context, request ProjectGetRequestObject) (ProjectGetResponseObject, error) {
	panic("not implemented")
}

func (s *Server) ProjectUpdate(ctx context.Context, request ProjectUpdateRequestObject) (ProjectUpdateResponseObject, error) {
	panic("not implemented")
}

func (s *Server) ProjectDelete(ctx context.Context, request ProjectDeleteRequestObject) (ProjectDeleteResponseObject, error) {
	panic("not implemented")
}
