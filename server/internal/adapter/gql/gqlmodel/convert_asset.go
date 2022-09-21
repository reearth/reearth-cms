package gqlmodel

import (
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/samber/lo"
)

const (
	PreviewTypeIMAGE   PreviewType = "IMAGE"
	PreviewTypeGEO     PreviewType = "GEO"
	PreviewTypeGEO3D   PreviewType = "GEO3D"
	PreviewTypeMODEL3D PreviewType = "MODEL3D"
)

func ToAsset(a *asset.Asset) *Asset {
	if a == nil {
		return nil
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
	}
}

func ToPreviewType(p *asset.PreviewType) *PreviewType {
	if p == nil {
		return nil
	}

	var p2 PreviewType
	switch *p {
	case asset.PreviewTypeIMAGE:
		p2 = PreviewTypeIMAGE
	case asset.PreviewTypeGEO:
		p2 = PreviewTypeGEO
	case asset.PreviewTypeGEO3D:
		p2 = PreviewTypeGEO3D
	case asset.PreviewTypeMODEL3D:
		p2 = PreviewTypeMODEL3D
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
		Children:    ToChildren(a.Children()),
	}
}

func ToChildren(c []*asset.File) []*AssetFile {
	if c == nil {
		return nil
	}

	var children []*AssetFile
	for _, a := range c {
		children = append(children, ToAssetFile(a))
	}
	return children
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
