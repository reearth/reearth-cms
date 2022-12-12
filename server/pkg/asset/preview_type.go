package asset

import (
	"strings"

	"github.com/samber/lo"
)

type PreviewType string

const (
	PreviewTypeImage   PreviewType = "image"
	PreviewTypeGeo     PreviewType = "geo"
	PreviewTypeGeo3d   PreviewType = "geo3d"
	PreviewTypeModel3d PreviewType = "model3d"
	PreviewTypeMvt     PreviewType = "mvt"
	PreviewTypeUnknown PreviewType = "unknown"
)

func PreviewTypeFrom(p string) (PreviewType, bool) {
	pp := strings.ToLower(p)
	switch PreviewType(pp) {
	case PreviewTypeImage:
		return PreviewTypeImage, true
	case PreviewTypeGeo:
		return PreviewTypeGeo, true
	case PreviewTypeGeo3d:
		return PreviewTypeGeo3d, true
	case PreviewTypeModel3d:
		return PreviewTypeModel3d, true
	case PreviewTypeMvt:
		return PreviewTypeMvt, true
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

func PreviewTypeFromContentType(c string) *PreviewType {
	if strings.HasPrefix(c, "image/") {
		return lo.ToPtr(PreviewTypeImage)
	}
	return lo.ToPtr(PreviewTypeUnknown)
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
