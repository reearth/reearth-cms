package integration

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
)

func ToAsset(a *asset.Asset, urlBuilder func(a *asset.File) string) *Asset {
	if a == nil {
		return nil
	}

	return &Asset{
		Id:          a.ID().Ref(),
		ContentType: lo.ToPtr(a.File().ContentType()),
		CreatedAt:   ToDate(a.CreatedAt()),
		// File:        ToFile(a.File()),
		Name:        lo.ToPtr(a.File().Name()),
		PreviewType: ToPreviewType(a.PreviewType()),
		ProjectId:   a.Project().Ref(),
		TotalSize:   lo.ToPtr(float32(a.Size())),
		File:        lo.ToPtr(ToFile(a.File(), urlBuilder)),
		// UpdatedAt: ToDate(a.Updated) TODO: add updated at
	}
}

func ToFile(f *asset.File, urlBuilder func(a *asset.File) string) File {
	if f == nil {
		return File{}
	}

	var url string
	if urlBuilder != nil {
		url = urlBuilder(f)
	}

	children := lo.Map(f.Children(), func(c *asset.File, _ int) File { return ToFile(c, urlBuilder) })

	return File{
		Name:        lo.ToPtr(f.Name()),
		ContentType: lo.ToPtr(f.ContentType()),
		Size:        lo.ToPtr(float32(f.Size())),
		Url:         lo.ToPtr(url),
		Children:    lo.ToPtr(children),
	}
}

func ToPreviewType(p *asset.PreviewType) *AssetPreviewType {
	if p == nil {
		return nil
	}

	var p2 AssetPreviewType
	switch *p {
	case asset.PreviewTypeImage:
		p2 = Image
	case asset.PreviewTypeGeo:
		p2 = Geo
	case asset.PreviewTypeGeo3d:
		p2 = Geo3d
	case asset.PreviewTypeModel3d:
		p2 = Model3d
	case asset.PreviewTypeUnknown:
		// p2 =
		// TODO: change here later
	default:
		return nil
	}

	return &p2
}
