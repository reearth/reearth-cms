package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type File struct {
	id          AssetFileID
	name        string
	size        uint64
	contentType string
	uploadedAt  time.Time
	uploadedBy  UserID
	children    id.AssetFileIDList
}

func (fr *File) ID() AssetFileID {
	return fr.id
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

func (fr *File) Children() id.AssetFileIDList {
	return fr.children
}
