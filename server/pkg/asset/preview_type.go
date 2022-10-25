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
	pp := strings.ToLower(*p)
	var p2 PreviewType
	switch PreviewType(pp) {
	case PreviewTypeImage:
		p2 = PreviewTypeImage
	case PreviewTypeGeo:
		p2 = PreviewTypeGeo
	case PreviewTypeGeo3d:
		p2 = PreviewTypeGeo3d
	case PreviewTypeModel3d:
		p2 = PreviewTypeModel3d
	case PreviewTypeUnknown:
		p2 = PreviewTypeUnknown
	default:
		return nil
	}

	return &p2
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
