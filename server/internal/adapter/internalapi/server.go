package internalapi

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/adapter/internalapi/internalapimodel"
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type server struct {
	pb.UnimplementedReEarthCMSServer
}

func NewServer() pb.ReEarthCMSServer {
	return &server{}
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.CreateProjectResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}
	p, err := uc.Project.Create(ctx, interfaces.CreateProjectParam{
		WorkspaceID:  wId,
		Name:         &req.Name,
		Description:  &req.Description,
		Alias:        &req.Alias,
		RequestRoles: []workspace.Role{},
	}, op)
	if err != nil {
		return nil, err
	}
	return &pb.CreateProjectResponse{
		Project: internalapimodel.ToProject(p),
	}, nil
}

func (s server) ListProjects(ctx context.Context, req *pb.ListProjectsRequest) (*pb.ListProjectsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	wId, err := accountdomain.WorkspaceIDFrom(req.WorkspaceId)
	if err != nil {
		return nil, err
	}
	p, _, err := uc.Project.FindByWorkspace(ctx, wId, usecasex.CursorPagination{
		After: nil,
		First: lo.ToPtr(int64(100)),
	}.Wrap(), op)
	if err != nil {
		return nil, err
	}
	res := lo.Map(p, func(p *project.Project, _ int) *pb.Project {
		return internalapimodel.ToProject(p)
	})
	return &pb.ListProjectsResponse{
		Projects:   res,
		TotalCount: int32(len(res)),
	}, nil
}

func (s server) ListModels(ctx context.Context, req *pb.ListModelsRequest) (*pb.ListModelsResponse, error) {
	op, uc := adapter.Operator(ctx), adapter.Usecases(ctx)

	pId, err := project.IDFrom(req.ProjectId)
	if err != nil {
		return nil, err
	}

	p, _, err := uc.Model.FindByProject(ctx, pId, usecasex.CursorPagination{
		After: nil,
		First: lo.ToPtr(int64(100)),
	}.Wrap(), op)
	if err != nil {
		return nil, err
	}

	res := lo.Map(p, func(p *model.Model, _ int) *pb.Model {
		return internalapimodel.ToModel(p)
	})
	return &pb.ListModelsResponse{
		Models:     res,
		TotalCount: int32(len(res)),
	}, nil
}

func (s server) GetModelGeoJSONExportURL(ctx context.Context, req *pb.ExportRequest) (*pb.ExportURLResponse, error) {
	return &pb.ExportURLResponse{
		Url: "http://localhost:8080",
	}, nil
}
