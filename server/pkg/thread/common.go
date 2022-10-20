package thread

import (
	"errors"
)

var (
	ErrNoWorkspaceID       = errors.New("WorkspaceID is required")
	ErrCommentAlreadyExist = errors.New("Comment already exist in this thread")
	ErrCommentDoesNotExist = errors.New("Comment does not exist in this thread")
)
