package mongodoc

import (
	"net/url"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/mongox"
)

type ProjectDocument struct {
	ID          string
	UpdatedAt   time.Time
	Name        string
	Description string
	Alias       string
	ImageURL    string
	Workspace   string
}

func NewProject(project *project.Project) (*ProjectDocument, string) {
	pid := project.ID().String()

	imageURL := ""
	if u := project.ImageURL(); u != nil {
		imageURL = u.String()
	}

	return &ProjectDocument{
		ID:          pid,
		UpdatedAt:   project.UpdatedAt(),
		Name:        project.Name(),
		Description: project.Description(),
		Alias:       project.Alias(),
		ImageURL:    imageURL,
		Workspace:   project.Workspace().String(),
	}, pid
}

func (d *ProjectDocument) Model() (*project.Project, error) {
	pid, err := id.ProjectIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	tid, err := id.WorkspaceIDFrom(d.Workspace)
	if err != nil {
		return nil, err
	}

	var imageURL *url.URL
	if d.ImageURL != "" {
		if imageURL, err = url.Parse(d.ImageURL); err != nil {
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
		Build()
}

type ProjectConsumer = mongox.SliceFuncConsumer[*ProjectDocument, *project.Project]

func NewProjectConsumer() *ProjectConsumer {
	return NewComsumer[*ProjectDocument, *project.Project]()
}
