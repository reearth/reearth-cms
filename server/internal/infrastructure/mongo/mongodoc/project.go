package mongodoc

import (
	"net/url"
	"time"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
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

type ProjectConsumer struct {
	Rows []*project.Project
}

func (c *ProjectConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc ProjectDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	proj, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, proj)
	return nil
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
