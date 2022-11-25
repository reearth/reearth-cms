package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
)

func NewAsset(a *asset.Asset, url string) (*Asset, error) {
	if a == nil {
		return nil, nil
	}

	return &Asset{
		Id:          a.ID().Ref(),
		ContentType: lo.ToPtr(a.File().ContentType()),
		CreatedAt:   lo.ToPtr(a.CreatedAt()),
		Name:        lo.ToPtr(a.File().Name()),
		PreviewType: ToPreviewType(a.PreviewType()),
		ProjectId:   a.Project().Ref(),
		TotalSize:   lo.ToPtr(float32(a.Size())),
		Url:         lo.ToPtr(url),
		File:        lo.ToPtr(ToFile(a.File())),
	}, nil
}

func ToFile(f *asset.File) File {
	if f == nil {
		return File{}
	}

	children := lo.Map(f.Children(), func(c *asset.File, _ int) File { return ToFile(c) })

	return File{
		Name:        lo.ToPtr(f.Name()),
		ContentType: lo.ToPtr(f.ContentType()),
		Size:        lo.ToPtr(float32(f.Size())),
		Path:        lo.ToPtr(f.Path()),
		Children:    lo.ToPtr(children),
	}
}

func ToPreviewType(pt *asset.PreviewType) *AssetPreviewType {
	if pt == nil {
		return lo.ToPtr(Unknown)
	}
	switch *pt {
	case asset.PreviewTypeGeo:
		return lo.ToPtr(Geo)
	case asset.PreviewTypeGeo3d:
		return lo.ToPtr(Geo3d)
	case asset.PreviewTypeModel3d:
		return lo.ToPtr(Model3d)
	case asset.PreviewTypeImage:
		return lo.ToPtr(Image)
	case asset.PreviewTypeUnknown:
		return lo.ToPtr(Unknown)
	default:
		return lo.ToPtr(Unknown)
	}
}
