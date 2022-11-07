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
	Thread      string
}

type File struct {
	Name        string
	Size        uint64
	ContentType string
	Path        string
	Children    []*File
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
		Thread:      a.Thread().String(),
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
	thid, err := id.ThreadIDFrom(d.Thread)
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
		Thread(thid).
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
		Name:        f.Name(),
		Size:        f.Size(),
		ContentType: f.ContentType(),
		Path:        f.Path(),
		Children:    c,
	}
}

func FromFile(f *File) *asset.File {
	if f == nil {
		return nil
	}

	var c []*asset.File
	if f.Children != nil && len(f.Children) > 0 {
		for _, v := range f.Children {
			c = append(c, FromFile(v))
		}
	}

	af := asset.NewFile().
		Name(f.Name).
		Size(f.Size).
		ContentType(f.ContentType).
		Path(f.Path).
		Children(c).
		Build()

	return af
}
