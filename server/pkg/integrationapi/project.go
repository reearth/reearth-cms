package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	var publication *ProjectPublication = nil
	if p.Publication() != nil {
		publication = &ProjectPublication{
			Scope:       ToProjectPublicationScope(p.Publication().Scope()),
			AssetPublic: lo.ToPtr(p.Publication().AssetPublic()),
			Token:       lo.ToPtr(p.Publication().Token()),
		}
	}

	var requestRoles *[]ProjectRequestRole = nil
	if p.RequestRoles() != nil {
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
		Id:           p.ID().Ref(),
		WorkspaceId:  p.Workspace().Ref(),
		Name:         lo.ToPtr(p.Name()),
		Description:  lo.ToPtr(p.Description()),
		Alias:        lo.ToPtr(p.Alias()),
		Publication:  publication,
		RequestRoles: requestRoles,
		CreatedAt:    lo.ToPtr(p.CreatedAt()),
		UpdatedAt:    lo.ToPtr(p.UpdatedAt()),
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
