package repo

import (
	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Container struct {
	Lock        Lock
	User        User
	Transaction Transaction
	Workspace   Workspace
}

func (c *Container) Filtered(team WorkspaceFilter) *Container {
	if c == nil {
		return c
	}
	return &Container{
		Lock:        c.Lock,
		Workspace:   c.Workspace,
		Transaction: c.Transaction,
		User:        c.User,
	}
}

type WorkspaceFilter struct {
	Readable user.WorkspaceIDList
	Writable user.WorkspaceIDList
}

func WorkspaceFilterFromOperator(o *usecase.Operator) WorkspaceFilter {
	return WorkspaceFilter{
		Readable: o.AllReadableWorkspaces(),
		Writable: o.AllWritableWorkspaces(),
	}
}
