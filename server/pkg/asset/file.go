package asset

import (
	"time"
)

type File struct {
	id          AssetFileID
	name        string
	size        uint64
	contentType string
	uploadedAt  time.Time
	uploadedBy  UserID
	children    []*AssetFileID
}

func (fr *File) Name() string {
	return fr.name
}

func (fr *File) ContentType() string {
	return fr.contentType
}

func (fr *File) Size() uint64 {
	return fr.size
}

func (fr *File) UploadedAt() time.Time {
	return fr.uploadedAt
}

func (fr *File) UploadedBy() UserID {
	return fr.uploadedBy
}
