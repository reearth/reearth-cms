package asset

import (
	"time"
)

type AssetFile struct {
	name         string
	size         uint64
	contentType  string
	uploadedAt   time.Time
	uploadedById UserID
	path         string
	children     []*AssetFile
}

func (af *AssetFile) Name() string {
	return af.name
}

func (af *AssetFile) Size() uint64 {
	return af.size
}

func (af *AssetFile) ContentType() string {
	return af.contentType
}

func (af *AssetFile) UploadedAt() time.Time {
	return af.uploadedAt
}

func (af *AssetFile) UploadedByID() UserID {
	return af.uploadedById
}

func (af *AssetFile) Path() string {
	return af.path
}

func (af *AssetFile) Children() []*AssetFile {
	if af == nil {
		return nil
	}
	return af.children
}
