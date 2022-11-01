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

	var createdBy ID
	var createdByType OperatorType
	if a.User() != nil {
		createdBy = IDFrom(*a.User())
		createdByType = OperatorTypeUser
	}
	if a.Integration() != nil {
		createdBy = IDFrom(*a.Integration())
		createdByType = OperatorTypeIntegration
	}

	return &Asset{
		ID:          IDFrom(a.ID()),
		ProjectID:   IDFrom(a.Project()),
		CreatedAt:   a.CreatedAt(),
		CreatedByID: createdBy,
		CreatedByType: createdByType,
		FileName:    a.FileName(),
		Size:        int64(a.Size()),
		PreviewType: ToPreviewType(a.PreviewType()),
		File:        ToAssetFile(a.File()),
		UUID:        a.UUID(),
		URL:         url,
		ThreadID:    IDFrom(a.Thread()),
	}
}

func FromPreviewType(p *PreviewType) *asset.PreviewType {
	if p == nil {
		return nil
	}

	var p2 asset.PreviewType
	switch *p {
	case PreviewTypeImage:
		p2 = asset.PreviewTypeImage
	case PreviewTypeGeo:
		p2 = asset.PreviewTypeGeo
	case PreviewTypeGeo3d:
		p2 = asset.PreviewTypeGeo3d
	case PreviewTypeModel3d:
		p2 = asset.PreviewTypeModel3d
	case PreviewTypeUnknown:
		p2 = asset.PreviewTypeUnknown
	default:
		return nil
	}

	return &p2
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
