package gqlmodel

import (
	"path/filepath"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func ToAsset(a *asset.Asset) *Asset {
	if a == nil {
		return nil
	}

	ai := a.AccessInfo()

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
		ID:                      IDFrom(a.ID()),
		ProjectID:               IDFrom(a.Project()),
		CreatedAt:               a.CreatedAt(),
		CreatedByID:             createdBy,
		CreatedByType:           createdByType,
		PreviewType:             ToPreviewType(a.PreviewType()),
		UUID:                    a.UUID(),
		URL:                     ai.Url,
		FileName:                a.FileName(),
		ThreadID:                IDFromRef(a.Thread()),
		ArchiveExtractionStatus: ToArchiveExtractionStatus(a.ArchiveExtractionStatus()),
		Size:                    int64(a.Size()),
		Public:                  ai.Public,
		ContentType:             detectContentTypeByFilename(a.FileName()),
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
	case PreviewTypeImageSVG:
		p2 = asset.PreviewTypeImageSvg
	case PreviewTypeGeo:
		p2 = asset.PreviewTypeGeo
	case PreviewTypeGeo3dTiles:
		p2 = asset.PreviewTypeGeo3dTiles
	case PreviewTypeGeoMvt:
		p2 = asset.PreviewTypeGeoMvt
	case PreviewTypeModel3d:
		p2 = asset.PreviewTypeModel3d
	case PreviewTypeCSV:
		p2 = asset.PreviewTypeCSV
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
	case asset.PreviewTypeImageSvg:
		p2 = PreviewTypeImageSVG
	case asset.PreviewTypeGeo:
		p2 = PreviewTypeGeo
	case asset.PreviewTypeGeo3dTiles:
		p2 = PreviewTypeGeo3dTiles
	case asset.PreviewTypeGeoMvt:
		p2 = PreviewTypeGeoMvt
	case asset.PreviewTypeModel3d:
		p2 = PreviewTypeModel3d
	case asset.PreviewTypeCSV:
		p2 = PreviewTypeCSV
	case asset.PreviewTypeUnknown:
		p2 = PreviewTypeUnknown
	default:
		return nil
	}

	return &p2
}

func ToArchiveExtractionStatus(s *asset.ArchiveExtractionStatus) *ArchiveExtractionStatus {
	if s == nil {
		return nil
	}

	var s2 ArchiveExtractionStatus
	switch *s {
	case asset.ArchiveExtractionStatusSkipped:
		s2 = ArchiveExtractionStatusSkipped
	case asset.ArchiveExtractionStatusPending:
		s2 = ArchiveExtractionStatusPending
	case asset.ArchiveExtractionStatusInProgress:
		s2 = ArchiveExtractionStatusInProgress
	case asset.ArchiveExtractionStatusDone:
		s2 = ArchiveExtractionStatusDone
	case asset.ArchiveExtractionStatusFailed:
		s2 = ArchiveExtractionStatusFailed
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
		Name:            a.Name(),
		Size:            int64(a.Size()),
		ContentType:     lo.EmptyableToPtr(a.ContentType()),
		ContentEncoding: lo.EmptyableToPtr(a.ContentEncoding()),
		Path:            a.Path(),
		FilePaths:       a.FilePaths(),
	}
}

func (s *AssetSort) Into() *usecasex.Sort {
	if s == nil {
		return nil
	}
	key := ""
	switch s.SortBy {
	case AssetSortTypeDate:
		key = "createdat"
	case AssetSortTypeName:
		key = "filename"
	case AssetSortTypeSize:
		key = "size"
	}
	if key == "" {
		return nil
	}
	return &usecasex.Sort{
		Key:      key,
		Reverted: s.Direction != nil && *s.Direction == SortDirectionDesc,
	}
}

func detectContentTypeByFilename(filename string) *string {
	ext := strings.ToLower(filepath.Ext(filename))

	var contentType string

	switch ext {
	case ".json":
		contentType = "application/json"
	case ".geojson":
		contentType = "application/geo+json"
	case ".csv":
		contentType = "text/csv"
	case ".html", ".htm":
		contentType = "text/html"
	case ".xml":
		contentType = "application/xml"
	case ".pdf":
		contentType = "application/pdf"
	case ".txt":
		contentType = "text/plain"
	default:
		return nil
	}

	return &contentType
}

func FromContentType(ct ContentTypesEnum) string {
	switch ct {
	case ContentTypesEnumJSON:
		return "application/json"
	case ContentTypesEnumGeojson:
		return "application/geo+json"
	case ContentTypesEnumCSV:
		return "text/csv"
	case ContentTypesEnumHTML:
		return "text/html"
	case ContentTypesEnumXML:
		return "application/xml"
	case ContentTypesEnumPDF:
		return "application/pdf"
	case ContentTypesEnumPlain:
		return "text/plain"
	default:
		return ""
	}
}
