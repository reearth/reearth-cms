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
	Create(context.Context, string, id.UserID, *usecase.UserOperator) (*user.Workspace, error)
	Update(context.Context, id.WorkspaceID, string, *usecase.UserOperator) (*user.Workspace, error)
	AddUserMember(context.Context, id.WorkspaceID, id.UserID, user.Role, *usecase.UserOperator) (*user.Workspace, error)
	AddIntegrationMember(context.Context, id.WorkspaceID, id.IntegrationID, user.Role, *usecase.UserOperator) (*user.Workspace, error)
	UpdateUser(context.Context, id.WorkspaceID, id.UserID, user.Role, *usecase.UserOperator) (*user.Workspace, error)
	UpdateIntegration(context.Context, id.WorkspaceID, id.IntegrationID, user.Role, *usecase.UserOperator) (*user.Workspace, error)
	RemoveUser(context.Context, id.WorkspaceID, id.UserID, *usecase.UserOperator) (*user.Workspace, error)
	RemoveIntegration(context.Context, id.WorkspaceID, id.IntegrationID, *usecase.UserOperator) (*user.Workspace, error)
	Remove(context.Context, id.WorkspaceID, *usecase.UserOperator) error
}
