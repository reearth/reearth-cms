package asset

import (
	"errors"
)

var (
	ErrNoProjectID = errors.New("projectID is required")
	ErrZeroSize    = errors.New("file size cannot be zero")
	ErrNoUser      = errors.New("createdBy is required")
	ErrNoThread    = errors.New("thread is required")
	ErrNoFile      = errors.New("file is required")
	ErrNoUUID      = errors.New("uuid is required")
)
