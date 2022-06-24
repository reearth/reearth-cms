package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
)

type Project interface {
	Filtered(filter WorkspaceFilter) Project
	FindByIDs(context.Context, id.ProjectIDList) ([]*project.Project, error)
	FindByID(context.Context, id.ProjectID) (*project.Project, error)
	FindByWorkspace(context.Context, id.WorkspaceID, *usecase.Pagination) ([]*project.Project, *usecase.PageInfo, error)
	FindByPublicName(context.Context, string) (*project.Project, error)
	CountByWorkspace(context.Context, id.WorkspaceID) (int, error)
	Save(context.Context, *project.Project) error
	Remove(context.Context, id.ProjectID) error
}
