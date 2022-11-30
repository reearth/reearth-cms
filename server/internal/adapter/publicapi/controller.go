package publicapi

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
)

var ErrInvalidProject = errors.New("invalid project")

type Controller struct {
	project          repo.Project
	usecases         *interfaces.Container
	assetUrlResolver asset.URLResolver
}

func NewController(project repo.Project, usecases *interfaces.Container, aur asset.URLResolver) *Controller {
	return &Controller{
		project:          project,
		usecases:         usecases,
		assetUrlResolver: aur,
	}
}

func (c *Controller) checkProject(ctx context.Context, prj string) error {
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

	// TODO: check token if the scope is limited
	// if pr.Publication().Scope() == project.PublicationScopeLimited {
	// 	t := pr.Publication().Token()
	// 	if op := adapter.Operator(ctx); op == nil || t == "" || op.PublicAPIToken != t {
	// 		return ErrInvalidProject
	// 	}
	// }

	return nil
}
