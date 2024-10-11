package asset

import (
	"path/filepath"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/samber/lo"
)

var (
	imageExtensions   = []string{".jpg", ".jpeg", ".png", ".gif", ".tiff", ".webp"}
	imageSVGExtension = ".svg"
	geoExtensions     = []string{".kml", ".czml", ".topojson", ".geojson"}
	geoMvtExtension   = ".mvt"
	model3dExtensions = []string{".gltf", ".glb"}
	csvExtension      = ".csv"
)

type PreviewType string

func (p PreviewType) Ref() *PreviewType {
	return &p
}

const (
	PreviewTypeImage      PreviewType = "image"
	PreviewTypeImageSvg   PreviewType = "image_svg"
	PreviewTypeGeo        PreviewType = "geo"
	PreviewTypeGeo3dTiles PreviewType = "geo_3d_tiles"
	PreviewTypeGeoMvt     PreviewType = "geo_mvt"
	PreviewTypeModel3d    PreviewType = "model_3d"
	PreviewTypeCSV        PreviewType = "csv"
	PreviewTypeUnknown    PreviewType = "unknown"
)

func PreviewTypeFrom(p string) (PreviewType, bool) {
	pp := strings.ToLower(p)
	switch PreviewType(pp) {
	case PreviewTypeImage:
		return PreviewTypeImage, true
	case PreviewTypeImageSvg:
		return PreviewTypeImageSvg, true
	case PreviewTypeGeo:
		return PreviewTypeGeo, true
	case PreviewTypeGeo3dTiles:
		return PreviewTypeGeo3dTiles, true
	case PreviewTypeGeoMvt:
		return PreviewTypeGeoMvt, true
	case PreviewTypeModel3d:
		return PreviewTypeModel3d, true
	case PreviewTypeCSV:
		return PreviewTypeCSV, true
	case PreviewTypeUnknown:
		return PreviewTypeUnknown, true
	default:
		return PreviewType(""), false
	}
}

func PreviewTypeFromRef(p *string) *PreviewType {
	if p == nil {
		return nil
	}

	pp, ok := PreviewTypeFrom(*p)
	if !ok {
		return nil
	}
	return &pp
}

func DetectPreviewType(f *file.File) *PreviewType {
	pt := PreviewTypeFromContentType(f.ContentType)
	if pt != PreviewTypeUnknown {
		return lo.ToPtr(pt)
	}
	ext := filepath.Ext(f.Name)
	pt = PreviewTypeFromExtension(ext)
	return lo.ToPtr(pt)
}

func PreviewTypeFromContentType(c string) PreviewType {
	if strings.HasPrefix(c, "image/") {
		if strings.HasPrefix(c, "image/svg") {
			return PreviewTypeImageSvg
		}
		return PreviewTypeImage
	}
	if strings.HasPrefix(c, "text/csv") {
		return PreviewTypeCSV
	}
	return PreviewTypeUnknown
}

func PreviewTypeFromExtension(ext string) PreviewType {
	if lo.Contains(imageExtensions, ext) {
		return PreviewTypeImage
	}
	if ext == imageSVGExtension {
		return PreviewTypeImageSvg
	}
	if lo.Contains(geoExtensions, ext) {
		return PreviewTypeGeo
	}
	if ext == geoMvtExtension {
		return PreviewTypeGeoMvt
	}
	if lo.Contains(model3dExtensions, ext) {
		return PreviewTypeModel3d
	}
	if ext == csvExtension {
		return PreviewTypeCSV
	}
	return PreviewTypeUnknown
}

func (p PreviewType) String() string {
	return string(p)
}

func (p *PreviewType) StringRef() *string {
	if p == nil {
		return nil
	}
	p2 := string(*p)
	return &p2
}
