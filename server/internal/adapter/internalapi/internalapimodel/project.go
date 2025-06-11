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
		Id:            p.ID().String(),
		Name:          p.Name(),
		Alias:         p.Alias(),
		Description:   lo.ToPtr(p.Description()),
		WorkspaceId:   p.Workspace().String(),
		Accessibility: ToProjectAccessibility(p.Accessibility()),
		CreatedAt:     timestamppb.New(p.ID().Timestamp()),
		UpdatedAt:     timestamppb.New(p.UpdatedAt()),
	}
}

func ToProjectPublication(p *project.PublicationSettings) *pb.ProjectPublicationSettings {
	if p == nil {
		return nil
	}

	return &pb.ProjectPublicationSettings{
		PublicModels: p.PublicModels().Strings(),
		PublicAssets: p.PublicAssets(),
	}
}

func ToApiKey(p *project.APIKey) *pb.APIKey {
	if p == nil {
		return nil
	}

	return &pb.APIKey{
		Id:          p.ID().String(),
		Name:        p.Name(),
		Description: p.Description(),
		Key:         p.Key(),
		Publication: ToProjectPublication(p.Publication()),
	}
}

func ToApiKeys(ps project.APIKeys) []*pb.APIKey {
	if ps == nil {
		return nil
	}

	return lo.Map(ps, func(p *project.APIKey, _ int) *pb.APIKey {
		return ToApiKey(p)
	})
}

func ToProjectAccessibility(p *project.Accessibility) *pb.ProjectAccessibility {
	if p == nil {
		return nil
	}

	return &pb.ProjectAccessibility{
		Visibility:  ToProjectPublicationVisibility(p.Visibility()),
		Publication: ToProjectPublication(p.Publication()),
		ApiKeys:     ToApiKeys(p.ApiKeys()),
	}
}

func ToProjectPublicationVisibility(p project.Visibility) pb.ProjectVisibility {
	switch p {
	case project.VisibilityPublic:
		return pb.ProjectVisibility_PUBLIC
	case project.VisibilityPrivate:
		return pb.ProjectVisibility_PRIVATE
	}
	return pb.ProjectVisibility_PUBLIC
}
