package internalapimodel

import (
	pb "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
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
		License:     lo.ToPtr(p.License()),
		Readme:      lo.ToPtr(p.Readme()),
		StarCount:   p.StarCount(),
		StarredBy:   p.StarredBy(),
		WorkspaceId: p.Workspace().String(),
		Visibility:  ToProjectVisibility(p.Accessibility().Visibility()),
		CreatedAt:   timestamppb.New(p.ID().Timestamp()),
		UpdatedAt:   timestamppb.New(p.UpdatedAt()),
	}
}

func ToProjectVisibility(p project.Visibility) pb.Visibility {
	switch p {
	case project.VisibilityPublic:
		return pb.Visibility_PUBLIC
	case project.VisibilityPrivate:
		return pb.Visibility_PRIVATE
	}
	return pb.Visibility_PUBLIC
}

func ProjectAccessibilityFromPB(v *pb.Visibility) *interfaces.AccessibilityParam {
	if v == nil {
		return nil
	}
	return &interfaces.AccessibilityParam{
		Visibility:  lo.ToPtr(ProjectPublicationVisibilityFromPB(*v)),
		Publication: nil,
	}
}

func ProjectPublicationVisibilityFromPB(v pb.Visibility) project.Visibility {
	switch v {
	case pb.Visibility_PUBLIC:
		return project.VisibilityPublic
	case pb.Visibility_PRIVATE:
		return project.VisibilityPrivate
	default:
		return project.VisibilityPublic
	}
}
