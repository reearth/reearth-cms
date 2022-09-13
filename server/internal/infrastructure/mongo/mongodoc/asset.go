package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type AssetDocument struct {
	ID          string
	Project     string
	CreatedAt   time.Time
	CreatedBy   string
	FileName    string
	Size        uint64
	PreviewType string
	File        *asset.File
	UUID        string
}

type AssetConsumer = mongox.SliceFuncConsumer[*AssetDocument, *asset.Asset]

func NewAssetConsumer() *AssetConsumer {
	return NewComsumer[*AssetDocument, *asset.Asset]()
}

func NewAsset(asset *asset.Asset) (*AssetDocument, string) {
	aid := asset.ID().String()
	return &AssetDocument{
		ID:          aid,
		Project:     asset.Project().String(),
		CreatedAt:   asset.CreatedAt(),
		CreatedBy:   asset.CreatedBy().String(),
		FileName:    asset.FileName(),
		Size:        asset.Size(),
		PreviewType: asset.PreviewType().String(),
		UUID:        asset.UUID(),
	}, aid
}

func (d *AssetDocument) Model() (*asset.Asset, error) {
	aid, err := id.AssetIDFrom(d.ID)
	if err != nil {
		return nil, err
	}
	pid, err := id.ProjectIDFrom(d.Project)
	if err != nil {
		return nil, err
	}
	uid, err := id.UserIDFrom(d.CreatedBy)
	if err != nil {
		return nil, err
	}

	if d.File == nil {
		d.File = &asset.File{}
	}

	f := &asset.File{}
	f.SetName(d.File.Name())
	f.SetSize(d.File.Size())
	f.SetContentType(d.File.ContentType())
	f.SetPath(d.File.Path())
	f.SetChildren(d.File.Children()...)

	return asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(d.CreatedAt).
		CreatedBy(uid).
		FileName(d.FileName).
		Size(d.Size).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(d.PreviewType))).
		File(f).
		UUID(d.UUID).
		Build()
}
