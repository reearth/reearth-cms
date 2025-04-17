package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	publication := &ProjectPublication{Scope: lo.ToPtr(PRIVATE)}
	if p.Publication() != nil {
		publication.Scope = ToProjectPublicationScope(p.Publication().Scope())
		publication.AssetPublic = lo.ToPtr(p.Publication().AssetPublic())
		publication.Token = lo.ToPtr(p.Publication().Token())
	}

	var requestRoles *[]ProjectRequestRole = nil
	if len(p.RequestRoles()) > 0 {
		r := lo.FilterMap(p.RequestRoles(), func(r workspace.Role, _ int) (ProjectRequestRole, bool) {
			role := ToRequestRole(r)
			if role != nil {
				return *role, true
			}
			return "", false
		})
		requestRoles = &r
	}

	return Project{
		Id:           p.ID(),
		WorkspaceId:  p.Workspace(),
		Name:         p.Name(),
		Description:  p.Description(),
		Alias:        p.Alias(),
		Publication:  publication,
		RequestRoles: requestRoles,
		CreatedAt:    p.CreatedAt(),
		UpdatedAt:    p.UpdatedAt(),
	}
}

func ToRequestRole(r workspace.Role) *ProjectRequestRole {
	switch r {
	case workspace.RoleOwner:
		return lo.ToPtr(OWNER)
	case workspace.RoleMaintainer:
		return lo.ToPtr(MAINTAINER)
	case workspace.RoleWriter:
		return lo.ToPtr(WRITER)
	case workspace.RoleReader:
		return lo.ToPtr(READER)
	default:
		return nil
	}
}

func ToProjectPublicationScope(p project.PublicationScope) *ProjectPublicationScope {
	switch p {
	case project.PublicationScopePublic:
		return lo.ToPtr(PUBLIC)
	case project.PublicationScopePrivate:
		return lo.ToPtr(PRIVATE)
	case project.PublicationScopeLimited:
		return lo.ToPtr(LIMITED)
	default:
		return nil
	}
}
