package user

import (
	"errors"

	"github.com/reearth/reearth-cms/server/pkg/workspace"
)

var (
	ErrInvalidName  = errors.New("invalid name")
	ErrInvalidEmail = errors.New("invalid email")
)

type User struct {
	id            ID
	name          string
	alias         string
	email         string
	metadata      Metadata
	host          *string
	myWorkspaceID string
	auths         []string
	workspaces    workspace.WorkspaceList
	myWorkspace   workspace.Workspace
}

func (u *User) ID() ID {
	return u.id
}

func (u *User) Name() string {
	return u.name
}

func (u *User) Alias() string {
	return u.alias
}

func (u *User) Email() string {
	return u.email
}

func (u *User) Metadata() Metadata {
	return u.metadata
}

func (u *User) Host() *string {
	return u.host
}

func (u *User) MyWorkspaceID() string {
	return u.myWorkspaceID
}

func (u *User) Auths() []string {
	if u.auths == nil {
		return []string{}
	}
	return append([]string{}, u.auths...)
}

func (u *User) Workspaces() workspace.WorkspaceList {
	return u.workspaces
}

func (u *User) MyWorkspace() workspace.Workspace {
	return u.myWorkspace
}

func (u *User) Clone() *User {
	if u == nil {
		return nil
	}
	
	var clonedAuths []string
	if u.auths != nil {
		clonedAuths = append([]string{}, u.auths...)
	}

	return &User{
		id:            u.id,
		name:          u.name,
		alias:         u.alias,
		email:         u.email,
		metadata:      u.metadata,
		host:          u.host,
		myWorkspaceID: u.myWorkspaceID,
		auths:         clonedAuths,
		workspaces:    u.workspaces,
		myWorkspace:   u.myWorkspace,
	}
}
