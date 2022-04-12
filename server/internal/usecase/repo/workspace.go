package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Workspace interface {
	FindByUser(context.Context, id.UserID) (user.WorkspaceList, error)
	FindByIDs(context.Context, []id.WorkspaceID) (user.WorkspaceList, error)
	FindByID(context.Context, id.WorkspaceID) (*user.Workspace, error)
	Save(context.Context, *user.Workspace) error
	SaveAll(context.Context, []*user.Workspace) error
	Remove(context.Context, id.WorkspaceID) error
	RemoveAll(context.Context, []id.WorkspaceID) error
}
