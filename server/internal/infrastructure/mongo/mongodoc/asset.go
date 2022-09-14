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
	File        *File
	UUID        string
}

type File struct {
	name        string
	size        uint64
	contentType string
	path        string
	children    []*File
}

type AssetConsumer = mongox.SliceFuncConsumer[*AssetDocument, *asset.Asset]

func NewAssetConsumer() *AssetConsumer {
	return NewComsumer[*AssetDocument, *asset.Asset]()
}

func NewAsset(asset *asset.Asset) (*AssetDocument, string) {
	aid := asset.ID().String()

	previewType := ""
	if pt := asset.PreviewType(); pt != nil {
		previewType = pt.String()
	}

	return &AssetDocument{
		ID:          aid,
		Project:     asset.Project().String(),
		CreatedAt:   asset.CreatedAt(),
		CreatedBy:   asset.CreatedBy().String(),
		FileName:    asset.FileName(),
		Size:        asset.Size(),
		PreviewType: previewType,
		File:        ToFile(asset.File()),
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
		d.File = &File{}
	}

	return asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(d.CreatedAt).
		CreatedBy(uid).
		FileName(d.FileName).
		Size(d.Size).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(d.PreviewType))).
		File(FromFile(d.File)).
		UUID(d.UUID).
		Build()
}

func ToFile(f *asset.File) *File {
	if f == nil {
		return nil
	}

	c := []*File{}
	if f.Children() != nil && len(f.Children()) > 0 {
		for _, v := range f.Children() {
			c = append(c, ToFile(v))
		}
	}

	return &File{
		name:        f.Name(),
		size:        f.Size(),
		contentType: f.ContentType(),
		path:        f.Path(),
		children:    c,
	}
}

func FromFile(f *File) *asset.File {
	if f == nil {
		return nil
	}

	c := []*asset.File{}
	if f.children != nil && len(f.children) > 0 {
		for _, v := range f.children {
			c = append(c, FromFile(v))
		}
	}

	af := asset.File{}
	af.SetName(f.name)
	af.SetSize(f.size)
	af.SetContentType(f.contentType)
	af.SetPath(f.path)
	af.SetChildren(c...)

	return &af
}
