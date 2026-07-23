package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
)

func NewAsset(a *asset.Asset, f *asset.File, all bool) *Asset {
	if a == nil {
		return nil
	}

	var ct, n *string
	if fct := f.ContentType(); fct != "" {
		ct = new(fct)
	}
	if fn := f.Name(); fn != "" {
		n = new(fn)
	}

	ai := a.AccessInfo()

	return &Asset{
		Id:                      a.ID(),
		ContentType:             ct,
		CreatedAt:               a.CreatedAt(),
		Name:                    n,
		PreviewType:             ToPreviewType(a.PreviewType()),
		ProjectId:               a.Project(),
		TotalSize:               new(float32(a.Size())),
		Url:                     ai.Url,
		File:                    ToAssetFile(f, all),
		ArchiveExtractionStatus: ToAssetArchiveExtractionStatus(a.ArchiveExtractionStatus()),
		Public:                  ai.Public,
	}
}

func ToAssetArchiveExtractionStatus(s *asset.ArchiveExtractionStatus) *AssetArchiveExtractionStatus {
	if s == nil {
		return nil
	}
	ss := ""
	switch *s {
	case asset.ArchiveExtractionStatusDone:
		ss = "done"
	case asset.ArchiveExtractionStatusFailed:
		ss = "failed"
	case asset.ArchiveExtractionStatusInProgress:
		ss = "in_progress"
	case asset.ArchiveExtractionStatusPending:
		ss = "pending"
	default:
		return nil
	}
	return new(AssetArchiveExtractionStatus(ss))
}

func ToAssetFile(f *asset.File, all bool) *File {
	if f == nil {
		return nil
	}

	var children *[]File
	if all {
		children = new(lo.FilterMap(f.Files(), func(c *asset.File, _ int) (File, bool) {
			f := ToAssetFile(c, true)
			if f == nil {
				return File{}, false
			}
			return *f, true
		}))
		if *children != nil && len(*children) == 0 {
			children = nil
		}
	}

	return &File{
		Name:        new(f.Name()),
		ContentType: new(f.ContentType()),
		Size:        new(float32(f.Size())),
		Path:        new(f.Path()),
		Children:    children,
	}
}

func ToPreviewType(pt *asset.PreviewType) *AssetPreviewType {
	if pt == nil {
		return new(Unknown)
	}
	switch *pt {
	case asset.PreviewTypeGeo:
		return new(Geo)
	case asset.PreviewTypeGeo3dTiles:
		return new(Geo3dTiles)
	case asset.PreviewTypeGeoMvt:
		return new(GeoMvt)
	case asset.PreviewTypeModel3d:
		return new(Model3d)
	case asset.PreviewTypeImage:
		return new(Image)
	case asset.PreviewTypeImageSvg:
		return new(ImageSvg)
	case asset.PreviewTypeCSV:
		return new(Csv)
	case asset.PreviewTypeUnknown:
		return new(Unknown)
	default:
		return new(Unknown)
	}
}
