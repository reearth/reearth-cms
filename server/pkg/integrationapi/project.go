package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	return Project{
		Id:          p.ID().Ref(),
		WorkspaceId: p.Workspace().Ref(),
		Name:        lo.ToPtr(p.Name()),
		Description: lo.ToPtr(p.Description()),
		Alias:       lo.ToPtr(p.Alias()),
		CreatedAt:   lo.ToPtr(p.CreatedAt()),
		UpdatedAt:   lo.ToPtr(p.UpdatedAt()),
	}
}
