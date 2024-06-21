package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	return Project{
		Alias:       lo.ToPtr(p.Alias()),
		CreatedAt:   lo.ToPtr(p.CreatedAt()),
		Description: lo.ToPtr(p.Description()),
		Id:          p.ID().Ref(),
		Name:        lo.ToPtr(p.Name()),
		UpdatedAt:   lo.ToPtr(p.UpdatedAt()),
	}
}
