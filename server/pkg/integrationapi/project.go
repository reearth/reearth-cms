package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/samber/lo"
)

func NewProject(p *project.Project) Project {
	accessibility := ToProjectAccessibility(p.Accessibility())

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
		Id:            p.ID(),
		WorkspaceId:   p.Workspace(),
		Name:          p.Name(),
		Description:   p.Description(),
		Alias:         p.Alias(),
		Accessibility: accessibility,
		RequestRoles:  requestRoles,
		CreatedAt:     p.CreatedAt(),
		UpdatedAt:     p.UpdatedAt(),
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

func ToProjectVisibility(p project.Visibility) AccessibilityVisibility {
	switch p {
	case project.VisibilityPublic:
		return PUBLIC
	case project.VisibilityPrivate:
		return PRIVATE
	default:
		return PUBLIC
	}
}

func ToProjectPublicationSettings(p *project.PublicationSettings) *PublicationSettings {
	if p == nil {
		return nil
	}
	return &PublicationSettings{
		PublicAssets: p.PublicAssets(),
		PublicModels: p.PublicModels(),
	}
}

func ToAPIKey(a *project.APIKey) *ApiKey {
	if a == nil {
		return nil
	}
	return &ApiKey{
		Id:          a.ID(),
		Key:         a.Key(),
		Name:        a.Name(),
		Description: lo.ToPtr(a.Description()),
		Publication: *ToProjectPublicationSettings(a.Publication()),
	}
}

func ToProjectAccessibility(a *project.Accessibility) Accessibility {
	if a == nil {
		return Accessibility{
			Visibility:  PUBLIC,
			ApiKeys:     nil,
			Publication: nil,
		}
	}
	if a.Visibility() == project.VisibilityPublic {
		return Accessibility{
			Visibility:  PUBLIC,
			Publication: nil,
			ApiKeys:     nil,
		}
	}
	return Accessibility{
		Visibility:  ToProjectVisibility(a.Visibility()),
		Publication: ToProjectPublicationSettings(a.Publication()),
		ApiKeys: lo.Map(a.ApiKeys(), func(apiKey *project.APIKey, _ int) ApiKey {
			return *ToAPIKey(apiKey)
		}),
	}
}
