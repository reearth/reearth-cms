package user

import (
	"errors"
	"net/mail"
	"regexp"

	"github.com/reearth/reearth-cms/server/pkg/workspace"
)

var (
	ErrInvalidName      = errors.New("invalid name")
	ErrInvalidEmail     = errors.New("invalid email")
	ErrInvalidAlias     = errors.New("invalid alias")
	ErrInvalidWorkspace = errors.New("invalid workspace")
	aliasRegexp         = regexp.MustCompile("^[a-zA-Z0-9_-]{3,32}$")
)

type User struct {
	id            ID
	name          string
	alias         string
	email         string
	metadata      Metadata
	host          *string
	myWorkspaceID WorkspaceID
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

func (u *User) MyWorkspaceID() WorkspaceID {
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

// ValidateEmail validates the email address format
func ValidateEmail(email string) bool {
	if email == "" {
		return false
	}
	_, err := mail.ParseAddress(email)
	return err == nil
}

// ValidateAlias validates the alias format (alphanumeric, underscore, hyphen, 3-32 chars)
func ValidateAlias(alias string) bool {
	if alias == "" {
		return true // alias is optional
	}
	return aliasRegexp.MatchString(alias)
}

// ValidateWorkspace validates that workspace ID and workspaces are consistent
func ValidateWorkspace(myWorkspaceID WorkspaceID, workspaces workspace.WorkspaceList) bool {
	// If no workspace ID is set, it's valid (workspace is optional)
	if myWorkspaceID.IsEmpty() {
		return true
	}
	
	// If workspace ID is set but no workspaces list, it's still valid
	if len(workspaces) == 0 {
		return true
	}
	
	// If both are set, verify that myWorkspaceID exists in workspaces
	for _, ws := range workspaces {
		if ws.ID().String() == myWorkspaceID.String() {
			return true
		}
	}
	
	// myWorkspaceID doesn't match any workspace in the list
	return false
}
