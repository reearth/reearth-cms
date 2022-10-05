package thread

import (
	"errors"
)

var (
	ErrNoWorkspaceID = errors.New("WorkspaceID is required")
)
