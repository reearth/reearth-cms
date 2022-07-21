package asset

import (
	"time"
)

type Asset struct {
	id          ID
	projectId   ProjectID
	createdAt   time.Time
	createdById UserID
	fileName    string
	size        uint64
	previewType *PreviewType
	file        *File
	hash        string
}

func (a *Asset) ID() ID {
	return a.id
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

func (a *Asset) File() *File {
	return a.file
}

func (a *Asset) Hash() string {
	return a.hash
}
