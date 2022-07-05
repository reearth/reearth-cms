package asset

import (
	"time"
)

type AssetFile struct {
	id          AssetFileID
	name        string
	url         string
	size        uint64
	contentType string
	uploadedAt  time.Time
	uploadedBy  UserID
	children    []*AssetFile
}

func (fr *AssetFile) Name() string {
	return fr.name
}

func (fr *AssetFile) Url() string {
	return fr.url
}

func (fr *AssetFile) ContentType() string {
	return fr.contentType
}

func (fr *AssetFile) Size() uint64 {
	return fr.size
}

func (fr *AssetFile) UploadedAt() time.Time {
	return fr.uploadedAt
}

func (fr *AssetFile) UploadedBy() UserID {
	return fr.uploadedBy
}
