package asset

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/project"
	"github.com/reearth/reearth-cms/server/pkg/user"
)

var (
	ErrNoProjectID = errors.New("ProjectID is required")
	ErrZeroSize      = errors.New("File size cannot be zero")
	ErrNoUser      = errors.New("CreatedByID is required")
)

type Asset struct {
	id          ID
	project   	*project.Project
	projectId   ProjectID
	createdAt   time.Time
	createdBy   *user.User
	createdById UserID
	fileName    string
	size        uint64
	previewType *PreviewType
	file        *AssetFile
	hash         string
}

func (a *Asset) ID() ID {
	return a.id
}

func (a *Asset) Project() *project.Project {
	return a.project
}

func (a *Asset) ProjectID() ProjectID {
	return a.projectId
}

func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}

	return a.createdAt
}

func (a *Asset) CreatedBy() *user.User {
	return a.createdBy
}

func (a *Asset) CreatedByID() UserID {
	return a.createdById
}

func (a *Asset) FileName() string {
	return a.fileName
}

func (a *Asset) Size() uint64 {
	return a.size
}

func (a *Asset) PreviewType() *PreviewType {
	return a.previewType
}

func (a *Asset) File() *AssetFile {
	return a.file
}

func (a *Asset) Hash() string {
	return a.hash
}
