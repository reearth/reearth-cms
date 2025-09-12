package user

import "github.com/reearth/reearth-cms/server/pkg/workspace"

type Builder struct {
	u *User
}

func New() *Builder {
	return &Builder{u: &User{}}
}

func (b *Builder) Build() (*User, error) {
	if b.u.id.IsNil() {
		return nil, ErrInvalidID
	}
	if b.u.name == "" {
		return nil, ErrInvalidName
	}
	if !ValidateEmail(b.u.email) {
		return nil, ErrInvalidEmail
	}
	if !ValidateAlias(b.u.alias) {
		return nil, ErrInvalidAlias
	}
	if !ValidateWorkspace(b.u.myWorkspaceID, b.u.workspaces) {
		return nil, ErrInvalidWorkspace
	}
	return b.u, nil
}

func (b *Builder) MustBuild() *User {
	r, err := b.Build()
	if err != nil {
		panic(err)
	}
	return r
}

func (b *Builder) ID(id ID) *Builder {
	b.u.id = id
	return b
}

func (b *Builder) NewID() *Builder {
	b.u.id = NewID()
	return b
}

func (b *Builder) Name(name string) *Builder {
	b.u.name = name
	return b
}

func (b *Builder) Alias(alias string) *Builder {
	b.u.alias = alias
	return b
}

func (b *Builder) Email(email string) *Builder {
	b.u.email = email
	return b
}

func (b *Builder) Metadata(metadata Metadata) *Builder {
	b.u.metadata = metadata
	return b
}

func (b *Builder) Host(host string) *Builder {
	b.u.host = &host
	return b
}

func (b *Builder) MyWorkspaceID(myWorkspaceID WorkspaceID) *Builder {
	b.u.myWorkspaceID = myWorkspaceID
	return b
}

func (b *Builder) Auths(auths []string) *Builder {
	b.u.auths = auths
	return b
}

func (b *Builder) Workspaces(workspaces workspace.WorkspaceList) *Builder {
	b.u.workspaces = workspaces
	return b
}

func (b *Builder) MyWorkspace(myWorkspace workspace.Workspace) *Builder {
	b.u.myWorkspace = myWorkspace
	return b
}
