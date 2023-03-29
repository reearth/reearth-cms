package mongodoc

import (
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/mongox"
	"github.com/samber/lo"
)

type AssetDocument struct {
	ID                      string
	Project                 string
	CreatedAt               time.Time
	User                    *string
	Integration             *string
	FileName                string
	Size                    uint64
	PreviewType             string
	File                    *FileDocument
	UUID                    string
	Thread                  string
	ArchiveExtractionStatus string
}

type FileDocument struct {
	Name        string
	Size        uint64
	ContentType string
	Path        string
	Children    []*FileDocument
}

type AssetConsumer = mongox.SliceFuncConsumer[*AssetDocument, *asset.Asset]

func NewAssetConsumer() *AssetConsumer {
	return NewConsumer[*AssetDocument, *asset.Asset]()
}

func NewAsset(a *asset.Asset) (*AssetDocument, string) {
	aid := a.ID().String()

	previewType := ""
	if pt := a.PreviewType(); pt != nil {
		previewType = pt.String()
	}

	archiveExtractionStatus := ""
	if s := a.ArchiveExtractionStatus(); s != nil {
		archiveExtractionStatus = s.String()
	}

	var file *asset.File
	if f := a.File(); f != nil {
		file = f
	}

	var uid, iid *string
	if a.User() != nil {
		uid = a.User().StringRef()
	}
	if a.Integration() != nil {
		iid = a.Integration().StringRef()
	}

	ad, id := &AssetDocument{
		ID:                      aid,
		Project:                 a.Project().String(),
		CreatedAt:               a.CreatedAt(),
		User:                    uid,
		Integration:             iid,
		FileName:                a.FileName(),
		Size:                    a.Size(),
		PreviewType:             previewType,
		File:                    toFile(file),
		UUID:                    a.UUID(),
		Thread:                  a.Thread().String(),
		ArchiveExtractionStatus: archiveExtractionStatus,
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
	thid, err := id.ThreadIDFrom(d.Thread)
	if err != nil {
		return nil, err
	}

	ab := asset.New().
		ID(aid).
		Project(pid).
		CreatedAt(d.CreatedAt).
		FileName(d.FileName).
		Size(d.Size).
		Type(asset.PreviewTypeFromRef(lo.ToPtr(d.PreviewType))).
		File(fromFile(d.File)).
		UUID(d.UUID).
		Thread(thid).
		ArchiveExtractionStatus(asset.ArchiveExtractionStatusFromRef(lo.ToPtr(d.ArchiveExtractionStatus)))

	if d.User != nil {
		uid, err := id.UserIDFrom(*d.User)
		if err != nil {
			return nil, err
		}
		ab = ab.CreatedByUser(uid)
	}

	if d.Integration != nil {
		iid, err := id.IntegrationIDFrom(*d.Integration)
		if err != nil {
			return nil, err
		}
		ab = ab.CreatedByIntegration(iid)
	}

	return ab.Build()
}

func toFile(f *asset.File) *FileDocument {
	if f == nil {
		return nil
	}

	c := []*FileDocument{}
	if f.Children() != nil && len(f.Children()) > 0 {
		for _, v := range f.Children() {
			c = append(c, toFile(v))
		}
	}

	return &FileDocument{
		Name:        f.Name(),
		Size:        f.Size(),
		ContentType: f.ContentType(),
		Path:        f.Path(),
		Children:    c,
	}
}

func fromFile(f *FileDocument) *asset.File {
	if f == nil {
		return nil
	}

	var c []*asset.File
	if f.Children != nil && len(f.Children) > 0 {
		for _, v := range f.Children {
			c = append(c, fromFile(v))
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
