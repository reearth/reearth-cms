package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
)

func ToProject(p *project.Project) *Project {
	if p == nil {
		return nil
	}

	return &Project{
		ID:          IDFrom(p.ID()),
		CreatedAt:   p.CreatedAt(),
		Alias:       p.Alias(),
		Name:        p.Name(),
		Description: p.Description(),
		UpdatedAt:   p.UpdatedAt(),
	}
}
