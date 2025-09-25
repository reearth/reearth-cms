package workspace

import (
	"errors"
	"regexp"
)

var (
	ErrInvalidAlias = errors.New("invalid alias")
	ErrInvalidName  = errors.New("invalid name")
	aliasRegexp     = regexp.MustCompile("^[a-zA-Z0-9_-]{3,32}$")
)

type Workspace struct {
	id       ID
	name     string
	alias    string
	metadata Metadata
	personal bool
	member   Member
}

type WorkspaceList []Workspace

func (w *Workspace) ID() ID {
	return w.id
}

func (w *Workspace) Name() string {
	return w.name
}

func (w *Workspace) Alias() string {
	return w.alias
}

func (w *Workspace) Metadata() Metadata {
	return w.metadata
}

func (w *Workspace) Personal() bool {
	return w.personal
}

func (w *Workspace) Member() Member {
	return w.member
}

// ValidateAlias validates the alias format (alphanumeric, underscore, hyphen, 3-32 chars)
func ValidateAlias(alias string) bool {
	if alias == "" {
		return true // alias is optional
	}
	return aliasRegexp.MatchString(alias)
}
