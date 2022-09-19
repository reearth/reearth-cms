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

func NewAsset(a *asset.Asset) (*AssetDocument, string) {
	aid := a.ID().String()

	previewType := ""
	if pt := a.PreviewType(); pt != nil {
		previewType = pt.String()
	}

	var file *asset.File
	if f := a.File(); f != nil {
		file = f
	}

	ad, id := &AssetDocument{
		ID:          aid,
		Project:     a.Project().String(),
		CreatedAt:   a.CreatedAt(),
		CreatedBy:   a.CreatedBy().String(),
		FileName:    a.FileName(),
		Size:        a.Size(),
		PreviewType: previewType,
		File:        ToFile(file),
		UUID:        a.UUID(),
	}, aid

	return ad, id
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
		f = &asset.File{}
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
		f = &File{}
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
