package asset

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
)

type AssetFile struct {
	id          AssetFileID
	assetID     ID
	name        string
	size        uint64
	contentType string
	uploadedAt  time.Time
	uploadedBy  UserID
	children    id.AssetFileIDList
}

func (af *AssetFile) ID() AssetFileID {
	return af.id
}

func (af *AssetFile) Asset() ID {
	return af.assetID
}

func (af *AssetFile) Name() string {
	return af.name
}

func (af *AssetFile) ContentType() string {
	return af.contentType
}

func (af *AssetFile) Size() uint64 {
	return af.size
}

func (af *AssetFile) UploadedAt() time.Time {
	return af.uploadedAt
}

func (af *AssetFile) UploadedBy() UserID {
	return af.uploadedBy
}

func (af *AssetFile) Children() id.AssetFileIDList {
	if af == nil {
		return nil
	}
	return af.children
}

func (af *AssetFile) AddChildren(children ...AssetFileID) {
	if af == nil {
		return
	}
	af.children = af.children.Add(children...)
}
