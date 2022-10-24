package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
)

func ToAsset(a *asset.Asset, urlResolver func(a *asset.Asset) string) *Asset {
	if a == nil {
		return nil
	}

	var url string
	if urlResolver != nil {
		url = urlResolver(a)
	}

	return &Asset{
		ID:          IDFrom(a.ID()),
		ProjectID:   IDFrom(a.Project()),
		CreatedAt:   a.CreatedAt(),
		CreatedByID: IDFrom(a.CreatedBy()),
		FileName:    a.FileName(),
		Size:        int64(a.Size()),
		PreviewType: ToPreviewType(a.PreviewType()),
		File:        ToAssetFile(a.File()),
		UUID:        a.UUID(),
		URL:         url,
	}
}

func ToPreviewType(p *asset.PreviewType) *PreviewType {
	if p == nil {
		return nil
	}

	var p2 PreviewType
	switch *p {
	case asset.PreviewTypeImage:
		p2 = PreviewTypeImage
	case asset.PreviewTypeGeo:
		p2 = PreviewTypeGeo
	case asset.PreviewTypeGeo3d:
		p2 = PreviewTypeGeo3d
	case asset.PreviewTypeModel3d:
		p2 = PreviewTypeModel3d
	case asset.PreviewTypeUnknown:
		p2 = PreviewTypeUnknown
	default:
		return nil
	}

	return &p2
}

func ToAssetFile(a *asset.File) *AssetFile {
	if a == nil {
		return nil
	}

	return &AssetFile{
		Name:        a.Name(),
		Size:        int64(a.Size()),
		ContentType: lo.ToPtr(a.ContentType()),
		Path:        a.Path(),
		Children:    lo.Map(a.Children(), func(c *asset.File, _ int) *AssetFile { return ToAssetFile(a) }),
	}
}

func AssetSortTypeFrom(a *AssetSortType) *asset.SortType {
	if a == nil {
		return nil
	}

	switch *a {
	case AssetSortTypeDate:
		return &asset.SortTypeDate
	case AssetSortTypeName:
		return &asset.SortTypeName
	case AssetSortTypeSize:
		return &asset.SortTypeSize
	}
	return nil
}
