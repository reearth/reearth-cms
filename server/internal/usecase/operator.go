package usecase

import (
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

type Operator struct {
	User               user.ID
	ReadableWorkspaces user.WorkspaceIDList
	WritableWorkspaces user.WorkspaceIDList
	OwningWorkspaces   user.WorkspaceIDList
}

func (o *Operator) Workspaces(r user.Role) []id.WorkspaceID {
	if o == nil {
		return nil
	}
	if r == user.RoleReader {
		return o.ReadableWorkspaces
	}
	if r == user.RoleWriter {
		return o.WritableWorkspaces
	}
	if r == user.RoleOwner {
		return o.OwningWorkspaces
	}
	return nil
}

func (o *Operator) AllReadableWorkspaces() user.WorkspaceIDList {
	return append(o.ReadableWorkspaces, o.AllWritableWorkspaces()...)
}

func (o *Operator) AllWritableWorkspaces() user.WorkspaceIDList {
	return append(o.WritableWorkspaces, o.AllOwningWorkspaces()...)
}

func (o *Operator) AllOwningWorkspaces() user.WorkspaceIDList {
	return o.OwningWorkspaces
}

func (o *Operator) IsReadableWorkspace(workspace ...id.WorkspaceID) bool {
	return o.AllReadableWorkspaces().Filter(workspace...).Len() > 0
}

func (o *Operator) IsWritableWorkspace(workspace ...id.WorkspaceID) bool {
	return o.AllWritableWorkspaces().Filter(workspace...).Len() > 0
}

func (o *Operator) IsOwningWorkspace(workspace ...id.WorkspaceID) bool {
	return o.AllOwningWorkspaces().Filter(workspace...).Len() > 0
}

func (o *Operator) AddNewWorkspace(workspace id.WorkspaceID) {
	o.OwningWorkspaces = append(o.OwningWorkspaces, workspace)
}
