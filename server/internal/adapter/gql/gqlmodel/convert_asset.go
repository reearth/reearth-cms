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
		ID:            IDFrom(a.ID()),
		ProjectID:     IDFrom(a.Project()),
		CreatedAt:     a.CreatedAt(),
		CreatedByID:   createdBy,
		CreatedByType: createdByType,
		FileName:      a.FileName(),
		Size:          int64(a.Size()),
		PreviewType:   ToPreviewType(a.PreviewType()),
		File:          ToAssetFile(a.File()),
		UUID:          a.UUID(),
		URL:           url,
		ThreadID:      IDFrom(a.Thread()),
		Status:        ToStatus(a.Status()),
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

func FromStatus(s *Status) *asset.Status {
	if s == nil {
		return nil
	}

	var s2 asset.Status
	switch *s {
	case StatusPending:
		s2 = asset.StatusPending
	case StatusInProgress:
		s2 = asset.StatusInProgress
	case StatusDone:
		s2 = asset.StatusDone
	case StatusFailed:
		s2 = asset.StatusFailed
	default:
		return nil
	}

	return &s2
}

func ToStatus(s *asset.Status) *Status {
	if s == nil {
		return nil
	}

	var s2 Status
	switch *s {
	case asset.StatusPending:
		s2 = StatusPending
	case asset.StatusInProgress:
		s2 = StatusInProgress
	case asset.StatusDone:
		s2 = StatusDone
	case asset.StatusFailed:
		s2 = StatusFailed
	default:
		return nil
	}

	return &s2
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
		Children:    lo.Map(a.Children(), func(c *asset.File, _ int) *AssetFile { return ToAssetFile(c) }),
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
