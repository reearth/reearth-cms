package thread

import (
	"errors"
)

var (
	ErrNoWorkspaceID       = errors.New("workspace id is required")
	ErrCommentAlreadyExist = errors.New("comment already exist in this thread")
	ErrCommentDoesNotExist = errors.New("comment does not exist in this thread")
)
