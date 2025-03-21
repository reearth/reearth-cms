package internalapi

import (
	"context"

	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type server struct {
	pb.UnimplementedReEarthCMSServer
}

func NewServer() pb.ReEarthCMSServer {
	return &server{}
}

func (s server) CreateProject(ctx context.Context, req *pb.CreateProjectRequest) (*pb.CreateProjectResponse, error) {
	return &pb.CreateProjectResponse{
		Project: &pb.Project{
			Id:          "1",
			Name:        "name",
			Description: "description",
			WorkspaceId: "1",
			Publication: &pb.ProjectPublication{
				Scope:       pb.ProjectPublicationScope_PUBLIC,
				AssetPublic: true,
				Token:       nil,
			},
			CreatedAt: timestamppb.Now(),
			UpdatedAt: timestamppb.Now(),
		},
	}, nil
}

func (s server) ListProjects(ctx context.Context, req *pb.ListProjectsRequest) (*pb.ListProjectsResponse, error) {
	return &pb.ListProjectsResponse{
		Projects: []*pb.Project{
			{
				Id:          "1",
				Name:        "name",
				Description: "description",
				WorkspaceId: "1",
				Publication: &pb.ProjectPublication{
					Scope:       pb.ProjectPublicationScope_PUBLIC,
					AssetPublic: true,
					Token:       nil,
				},
				CreatedAt: timestamppb.Now(),
				UpdatedAt: timestamppb.Now(),
			},
		},
		TotalCount: 1,
	}, nil
}

func (s server) ListModels(ctx context.Context, req *pb.ListModelsRequest) (*pb.ListModelsResponse, error) {
	return &pb.ListModelsResponse{
		Models: []*pb.Model{
			{
				Id:          "1",
				ProjectId:   "1",
				Name:        "name",
				Description: "description",
				Key:         "key",
				Public:      false,
				CreatedAt:   timestamppb.Now(),
				UpdatedAt:   timestamppb.Now(),
			},
		},
	}, nil
}

func (s server) GetModelGeoJSONExportURL(ctx context.Context, req *pb.ExportRequest) (*pb.ExportURLResponse, error) {
	return &pb.ExportURLResponse{
		Url: "http://localhost:8080",
	}, nil
}
