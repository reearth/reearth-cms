package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/account/accountdomain/workspace"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type ProjectDocument struct {
	ID            string
	UpdatedAt     time.Time
	Name          string
	Description   string
	Alias         string
	ImageURL      string
	Workspace     string
	Accessibility *ProjectAccessibilityDocument
	RequestRoles  []string
}

type PublicationSettingsDocument struct {
	PublicModels []string
	PublicAssets bool
}

type ProjectAccessibilityDocument struct {
	Visibility  string
	Publication *PublicationSettingsDocument
	Keys        []APIKeyDocument
}

type APIKeyDocument struct {
	ID          string
	Name        string
	Description string
	Key         string
	Publication *PublicationSettingsDocument
}

func NewProject(project *project.Project) (*ProjectDocument, string) {
	pid := project.ID().String()

	imageURL := ""
	if u := project.ImageURL(); u != nil {
		imageURL = u.String()
	}

	return &ProjectDocument{
		ID:            pid,
		UpdatedAt:     project.UpdatedAt(),
		Name:          project.Name(),
		Description:   project.Description(),
		Alias:         project.Alias(),
		ImageURL:      imageURL,
		Workspace:     project.Workspace().String(),
		Accessibility: NewProjectAccessibility(project.Accessibility()),
		RequestRoles:  fromRequestRoles(project.RequestRoles()),
	}, pid
}

func NewProjectPublicationSettings(p *project.PublicationSettings) *PublicationSettingsDocument {
	if p == nil {
		return nil
	}
	return &PublicationSettingsDocument{
		PublicModels: p.PublicModels().Strings(),
		PublicAssets: p.PublicAssets(),
	}
}

func NewProjectAccessibility(p *project.Accessibility) *ProjectAccessibilityDocument {
	if p == nil {
		return nil
	}
	var keys []APIKeyDocument
	if len(p.ApiKeys()) > 0 {
		keys = lo.Map(p.ApiKeys(), func(at *project.APIKey, _ int) APIKeyDocument {
			return *NewAccessTokenDocument(at)
		})
	}
	return &ProjectAccessibilityDocument{
		Visibility:  p.Visibility().String(),
		Publication: NewProjectPublicationSettings(p.Publication()),
		Keys:        keys,
	}
}

func NewAccessTokenDocument(at *project.APIKey) *APIKeyDocument {
	if at == nil {
		return nil
	}

	return &APIKeyDocument{
		ID:          at.ID().String(),
		Name:        at.Name(),
		Description: at.Description(),
		Key:         at.Key(),
		Publication: NewProjectPublicationSettings(at.Publication()),
	}
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := accountdomain.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if d.ImageURL != "" {
		if imageURL, err = url.Parse(d.ImageURL); err != nil || imageURL.Host == "" || imageURL.Scheme == "" {
			imageURL = nil
		}
	}

	return project.New().
		ID(pid).
		UpdatedAt(d.UpdatedAt).
		Name(d.Name).
		Description(d.Description).
		Alias(d.Alias).
		Workspace(tid).
		ImageURL(imageURL).
		Accessibility(d.Accessibility.Model()).
		RequestRoles(toRequestRoles(d.RequestRoles)).
		Build()
}

func (d *PublicationSettingsDocument) Model() *project.PublicationSettings {
	if d == nil {
		return nil
	}

	var mIds project.ModelIDList
	if len(d.PublicModels) > 0 {
		var err error
		mIds, err = id.ModelIDListFrom(d.PublicModels)
		if err != nil {
			return nil
		}
	}

	return project.NewPublicationSettings(mIds, d.PublicAssets)
}

func (d *ProjectAccessibilityDocument) Model() *project.Accessibility {
	if d == nil {
		return project.NewPublicAccessibility()
	}
	var keys project.APIKeys
	if len(d.Keys) > 0 {
		keys = lo.Map(d.Keys, func(t APIKeyDocument, _ int) *project.APIKey {
			return t.Model()
		})
	}

	return project.NewAccessibility(project.Visibility(d.Visibility), d.Publication.Model(), keys)
}

func (d *APIKeyDocument) Model() *project.APIKey {
	if d == nil {
		return nil
	}

	atId, err := project.AccessTokenIDFrom(d.ID)
	if err != nil {
		return nil
	}

	return project.NewAPIKeyBuilder().
		ID(atId).
		Name(d.Name).
		Description(d.Description).
		Key(d.Key).
		Publication(d.Publication.Model()).
		Build()
}

type ProjectConsumer = mongox.SliceFuncConsumer[*ProjectDocument, *project.Project]

func NewProjectConsumer() *ProjectConsumer {
	return NewConsumer[*ProjectDocument, *project.Project]()
}

func toRequestRoles(s []string) []workspace.Role {
	var roles []workspace.Role
	for _, role := range s {
		r, _ := workspace.RoleFrom(role)
		roles = append(roles, r)
	}
	return roles
}

func fromRequestRoles(s []workspace.Role) []string {
	var roles []string
	for _, role := range s {
		roles = append(roles, string(role))
	}
	return roles
}
