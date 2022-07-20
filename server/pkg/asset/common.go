package asset

import (
	"errors"
)

var (
	ErrNoProjectID = errors.New("ProjectID is required")
	ErrZeroSize    = errors.New("File size cannot be zero")
	ErrNoUser      = errors.New("CreatedByID is required")
)

func getStrRef(i string) *string {
	return &i
}
