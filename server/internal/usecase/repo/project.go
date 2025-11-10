package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/usecasex"
)

type Project interface {
	Filtered(filter WorkspaceFilter) Project
	FindByID(context.Context, id.ProjectID) (*project.Project, error)
	FindByIDOrAlias(context.Context, accountdomain.WorkspaceID, project.IDOrAlias) (*project.Project, error)
	FindByIDs(context.Context, id.ProjectIDList) (project.List, error)
	Search(context.Context, interfaces.ProjectFilter) (project.List, *usecasex.PageInfo, error)
	IsAliasAvailable(context.Context, accountdomain.WorkspaceID, string) (bool, error)
	CountByWorkspace(context.Context, accountdomain.WorkspaceID) (int, error)
	FindByPublicAPIKey(context.Context, string) (*project.Project, error)
	Save(context.Context, *project.Project) error
	Remove(context.Context, id.ProjectID) error
}
