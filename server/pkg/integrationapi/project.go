package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	return Project{
		Id:           p.ID().Ref(),
		WorkspaceId:  p.Workspace().Ref(),
		Name:         lo.ToPtr(p.Name()),
		Description:  lo.ToPtr(p.Description()),
		Alias:        lo.ToPtr(p.Alias()),
		Publication:  ToProjectPublication(p.Publication()),
		RequestRoles: ToRequestRoles(p.RequestRoles()),
		CreatedAt:    lo.ToPtr(p.CreatedAt()),
		UpdatedAt:    lo.ToPtr(p.UpdatedAt()),
	}
}

func ToRequestRoles(roles []workspace.Role) *[]ProjectRequestRole {
	if roles == nil {
		return nil
	}
	res := lo.FilterMap(roles, func(r workspace.Role, _ int) (ProjectRequestRole, bool) {
		role := ToRequestRole(r)
		if role != nil {
			return *role, true
		}
		return "", false
	})
	if len(res) == 0 {
		return nil
	}
	return &res
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
	}
	return nil
}

func ToProjectPublication(p *project.Publication) *ProjectPublication {
	if p == nil {
		return nil
	}

	return &ProjectPublication{
		Scope:       ToProjectPublicationScope(p.Scope()),
		AssetPublic: lo.ToPtr(p.AssetPublic()),
		Token:       lo.ToPtr(p.Token()),
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
	}
	return nil
}
