package asset

import (
	"errors"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

var (
	ErrEmptyProjectID = errors.New("require project id")
	ErrEmptySize      = errors.New("file size cannot be zero")
)

type Asset struct {
	id        ID
	projectID ProjectID
	createdAt time.Time
	createdBy UserID
	fileName  string
	assetType string
	size      uint64
	files     id.AssetFileIDList
}

func (a *Asset) ID() ID {
	return a.id
}

func (a *Asset) Project() ProjectID {
	return a.projectID
}

func (a *Asset) CreatedBy() UserID {
	return a.createdBy
}

func (a *Asset) CreatedAt() time.Time {
	if a == nil {
		return time.Time{}
	}

	return a.createdAt
}

func (a *Asset) FileName() string {
	return a.fileName
}

func (a *Asset) AssetType() string {
	return a.assetType
}

func (a *Asset) Size() uint64 {
	return a.size
}

func (a *Asset) Files() id.AssetFileIDList {
	if a == nil {
		return nil
	}
	return a.files
}

func (a *Asset) AddFiles(files ...AssetFileID) {
	if a == nil {
		return
	}
	a.files = a.files.Add(files...)
}
