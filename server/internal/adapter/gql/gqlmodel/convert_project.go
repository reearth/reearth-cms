package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/util"
	"github.com/samber/lo"
)

func ToProject(p *project.Project) *Project {
	if p == nil {
		return nil
	}

	return &Project{
		ID:            IDFrom(p.ID()),
		WorkspaceID:   IDFrom(p.Workspace()),
		CreatedAt:     p.CreatedAt(),
		Alias:         p.Alias(),
		Name:          p.Name(),
		Description:   p.Description(),
		UpdatedAt:     p.UpdatedAt(),
		Accessibility: ToProjectAccessibility(p.Accessibility()),
		RequestRoles:  lo.Map(p.RequestRoles(), func(r workspace.Role, _ int) Role { return ToRole(r) }),
	}
}

func ToPublication(p *project.PublicationSettings) *PublicationSettings {
	if p == nil {
		return nil
	}

	return &PublicationSettings{
		PublicModels: lo.Map(p.PublicModels(), func(m project.ModelID, _ int) ID { return IDFrom(m) }),
		PublicAssets: p.PublicAssets(),
	}
}

func ToAPIKeyPayload(p *project.Project, id project.APIKeyID) *APIKeyPayload {
	if p == nil {
		return nil
	}

	key := p.Accessibility().APIKeyById(id)
	if key == nil {
		return &APIKeyPayload{
			APIKey: nil,
			Public: ToPublication(p.Accessibility().Publication()),
		}
	}

	return &APIKeyPayload{
		APIKey: ToAPIKey(key),
		Public: ToPublication(p.Accessibility().Publication()),
	}
}

func ToAPIKey(p *project.APIKey) *ProjectAPIKey {
	if p == nil {
		return nil
	}

	return &ProjectAPIKey{
		ID:          IDFrom(p.ID()),
		Name:        p.Name(),
		Description: p.Description(),
		Key:         p.Key(),
		Publication: ToPublication(p.Publication()),
	}
}

func ToAPIKeys(ps project.APIKeys) []*ProjectAPIKey {
	if ps == nil {
		return nil
	}

	return lo.Map(ps, func(p *project.APIKey, _ int) *ProjectAPIKey {
		return ToAPIKey(p)
	})
}

func ToProjectAccessibility(p *project.Accessibility) *ProjectAccessibility {
	if p == nil {
		return nil
	}

	return &ProjectAccessibility{
		Visibility:  ToProjectVisibility(p.Visibility()),
		Publication: ToPublication(p.Publication()),
		APIKeys:     ToAPIKeys(p.ApiKeys()),
	}
}

func ToProjectVisibility(p project.Visibility) ProjectVisibility {
	switch p {
	case project.VisibilityPrivate:
		return ProjectVisibilityPrivate
	}
	return ProjectVisibilityPublic
}

func FromProjectVisibility(p *ProjectVisibility) *project.Visibility {
	if p == nil {
		return nil
	}
	switch *p {
	case ProjectVisibilityPrivate:
		return lo.ToPtr(project.VisibilityPrivate)
	}
	return lo.ToPtr(project.VisibilityPublic)
}

func FromPublicationSettings(p *UpdatePublicationSettingsInput) *interfaces.PublicationSettingsParam {
	if p == nil {
		return nil
	}
	models, err := util.TryMap(p.PublicModels, func(m ID) (project.ModelID, error) { return ToID[id.Model](m) })
	if err != nil {
		return nil
	}
	return &interfaces.PublicationSettingsParam{
		PublicModels: models,
		PublicAssets: p.PublicAssets,
	}
}
