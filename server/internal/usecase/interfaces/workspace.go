package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

var (
	ErrOwnerCannotLeaveTheWorkspace = errors.New("owner user cannot leave from the workspace")
	ErrCannotChangeOwnerRole        = errors.New("cannot change the role of the workspace owner")
	ErrCannotDeleteWorkspace        = errors.New("cannot delete workspace because at least one project is left")
	ErrWorkspaceWithProjects        = errors.New("target workspace still has some project")
)

type Workspace interface {
	Fetch(context.Context, []id.WorkspaceID, *usecase.Operator) ([]*user.Workspace, error)
	FindByUser(context.Context, id.UserID, *usecase.Operator) ([]*user.Workspace, error)
	Create(context.Context, string, id.UserID, *usecase.Operator) (*user.Workspace, error)
	Update(context.Context, id.WorkspaceID, string, *usecase.Operator) (*user.Workspace, error)
	AddMember(context.Context, id.WorkspaceID, id.UserID, user.Role, *usecase.Operator) (*user.Workspace, error)
	RemoveMember(context.Context, id.WorkspaceID, id.UserID, *usecase.Operator) (*user.Workspace, error)
	UpdateMember(context.Context, id.WorkspaceID, id.UserID, user.Role, *usecase.Operator) (*user.Workspace, error)
	Remove(context.Context, id.WorkspaceID, *usecase.Operator) error
}
