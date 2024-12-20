package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func ToProject(p *project.Project) *Project {
	if p == nil {
		return nil
	}

	return &Project{
		ID:           IDFrom(p.ID()),
		WorkspaceID:  IDFrom(p.Workspace()),
		CreatedAt:    p.CreatedAt(),
		Alias:        p.Alias(),
		Name:         p.Name(),
		Description:  p.Description(),
		UpdatedAt:    p.UpdatedAt(),
		Publication:  ToProjectPublication(p.Publication()),
		RequestRoles: lo.Map(p.RequestRoles(), func(r workspace.Role, _ int) Role { return ToRole(r) }),
	}
}

func ToProjectPublication(p *project.Publication) *ProjectPublication {
	if p == nil {
		return nil
	}

	token := lo.ToPtr(p.Token())
	if p.Scope() != project.PublicationScopeLimited {
		token = nil
	}

	return &ProjectPublication{
		Scope:       ToProjectPublicationScope(p.Scope()),
		AssetPublic: p.AssetPublic(),
		Token:       token,
	}
}

func ToProjectPublicationScope(p project.PublicationScope) ProjectPublicationScope {
	switch p {
	case project.PublicationScopePublic:
		return ProjectPublicationScopePublic
	case project.PublicationScopeLimited:
		return ProjectPublicationScopeLimited
	}
	return ProjectPublicationScopePrivate
}

func FromProjectPublicationScope(p ProjectPublicationScope) project.PublicationScope {
	switch p {
	case ProjectPublicationScopePublic:
		return project.PublicationScopePublic
	case ProjectPublicationScopeLimited:
		return project.PublicationScopeLimited
	}
	return project.PublicationScopePrivate
}
