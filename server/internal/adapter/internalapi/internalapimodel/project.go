package internalapimodel

import (
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/samber/lo"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ToProject(p *project.Project) *pb.Project {
	if p == nil {
		return nil
	}

	return &pb.Project{
		Id:          p.ID().String(),
		Name:        p.Name(),
		Alias:       p.Alias(),
		Description: lo.ToPtr(p.Description()),
		WorkspaceId: p.Workspace().String(),
		Publication: ToProjectPublication(p.Publication()),
		CreatedAt:   timestamppb.New(p.ID().Timestamp()),
		UpdatedAt:   timestamppb.New(p.UpdatedAt()),
	}
}

func ToProjectPublication(p *project.Publication) *pb.ProjectPublication {
	if p == nil {
		return nil
	}

	token := p.Token()
	if p.Scope() != project.PublicationScopeLimited {
		token = ""
	}
	return &pb.ProjectPublication{
		Scope:       ToProjectPublicationScope(p.Scope()),
		AssetPublic: p.AssetPublic(),
		Token:       &token,
	}
}

func ToProjectPublicationScope(p project.PublicationScope) pb.ProjectPublicationScope {
	switch p {
	case project.PublicationScopePublic:
		return pb.ProjectPublicationScope_PUBLIC
	case project.PublicationScopeLimited:
		return pb.ProjectPublicationScope_LIMITED
	}
	return pb.ProjectPublicationScope_PRIVATE
}
