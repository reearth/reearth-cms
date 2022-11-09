package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
)

var ErrInvalidProject = errors.New("invalid project")

type Controller struct {
	project  repo.Project
	usecases *interfaces.Container
}

func NewController(project repo.Project, usecases *interfaces.Container) *Controller {
	return &Controller{
		project:  project,
		usecases: usecases,
	}
}

func (c *Controller) checkProject(ctx context.Context, prj string) error {
	o := adapter.Operator(ctx)
	if o != nil {
		if o.PublicAPIProject == nil {
			return ErrInvalidProject
		}

		pid, err := id.ProjectIDFrom(prj)
		if err != nil || o.PublicAPIProject.ID() != pid {
			return ErrInvalidProject
		}

		return nil
	}

	pid, err := id.ProjectIDFrom(prj)
	if err != nil {
		return ErrInvalidProject
	}

	pr, err := c.project.FindByID(ctx, pid)
	if err != nil {
		return ErrInvalidProject
	}

	if pr.Publication().Scope() != project.PublicationScopePublic {
		return ErrInvalidProject
	}

	return nil
}
