package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/samber/lo"
	"go.mongodb.org/mongo-driver/bson"
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

type AssetConsumer struct {
	Rows []*asset.Asset
}

func (c *AssetConsumer) Consume(raw bson.Raw) error {
	if raw == nil {
		return nil
	}

	var doc AssetDocument
	if err := bson.Unmarshal(raw, &doc); err != nil {
		return err
	}
	asset, err := doc.Model()
	if err != nil {
		return err
	}
	c.Rows = append(c.Rows, asset)
	return nil
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

	return asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(d.CreatedAt).
		CreatedBy(uid).
		FileName(d.FileName).
		Size(d.Size).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(d.PreviewType))).
		File(d.File).
		UUID(d.UUID).
		Build()
}
