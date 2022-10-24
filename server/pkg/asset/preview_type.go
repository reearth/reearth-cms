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

func PreviewTypeFrom(p *string) *PreviewType {
	if p == nil {
		return nil
	}
	var p2 PreviewType
	switch PreviewType(*p) {
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
	return lo.ToPtr(PreviewTypeGeo)
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
