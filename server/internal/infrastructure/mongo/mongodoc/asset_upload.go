package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
)

type AssetUploadDocument struct {
	UUID            string    `bson:"uuid"`
	Project         string    `bson:"project"`
	FileName        string    `bson:"filename"`
	ExpiresAt       time.Time `bson:"expires_at"`
	ContentLength   int64     `bson:"content_length"`
	ContentType     string    `bson:"content_type"`
	ContentEncoding string    `bson:"content_encoding"`
}

func NewAssetUpload(u *asset.Upload) *AssetUploadDocument {
	return &AssetUploadDocument{
		UUID:            u.UUID(),
		Project:         u.Project().String(),
		FileName:        u.FileName(),
		ExpiresAt:       u.ExpiresAt(),
		ContentLength:   u.ContentLength(),
		ContentType:     u.ContentType(),
		ContentEncoding: u.ContentEncoding(),
	}
}

func (d *AssetUploadDocument) Model() (*asset.Upload, error) {
	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	return asset.NewUpload().
		UUID(d.UUID).
		Project(pid).
		FileName(d.FileName).
		ExpiresAt(d.ExpiresAt).
		ContentLength(d.ContentLength).
		ContentType(d.ContentType).
		ContentEncoding(d.ContentEncoding).
		Build(), nil
}

type AssetUploadConsumer = mongox.SliceFuncConsumer[*AssetUploadDocument, *asset.Upload]

func NewAssetUploadConsumer() *AssetUploadConsumer {
	return NewConsumer[*AssetUploadDocument, *asset.Upload]()
}
