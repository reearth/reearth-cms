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
	ReadableProjects   user.ProjectIDList
	WritableProjects   user.ProjectIDList
	OwningProjects     user.ProjectIDList
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
	return o.AllReadableWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) IsWritableWorkspace(workspace ...id.WorkspaceID) bool {
	return o.AllWritableWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) IsOwningWorkspace(workspace ...id.WorkspaceID) bool {
	return o.AllOwningWorkspaces().Intersect(workspace).Len() > 0
}

func (o *Operator) AddNewWorkspace(workspace id.WorkspaceID) {
	o.OwningWorkspaces = append(o.OwningWorkspaces, workspace)
}

func (o *Operator) Projects(r user.Role) []id.ProjectID {
	if o == nil {
		return nil
	}
	if r == user.RoleReader {
		return o.ReadableProjects
	}
	if r == user.RoleWriter {
		return o.WritableProjects
	}
	if r == user.RoleOwner {
		return o.OwningProjects
	}
	return nil
}

func (o *Operator) AllReadableProjects() user.ProjectIDList {
	return append(o.ReadableProjects, o.AllWritableProjects()...)
}

func (o *Operator) AllWritableProjects() user.ProjectIDList {
	return append(o.WritableProjects, o.AllOwningProjects()...)
}

func (o *Operator) AllOwningProjects() user.ProjectIDList {
	return o.OwningProjects
}

func (o *Operator) IsReadableProject(Project ...id.ProjectID) bool {
	return o.AllReadableProjects().Intersect(Project).Len() > 0
}

func (o *Operator) IsWritableProject(Project ...id.ProjectID) bool {
	return o.AllWritableProjects().Intersect(Project).Len() > 0
}

func (o *Operator) IsOwningProject(Project ...id.ProjectID) bool {
	return o.AllOwningProjects().Intersect(Project).Len() > 0
}

func (o *Operator) AddNewProject(Project id.ProjectID) {
	o.OwningProjects = append(o.OwningProjects, Project)
}
