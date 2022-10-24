package asset

import (
	"strings"

	"github.com/samber/lo"
)

type PreviewType string

const (
	PreviewTypeIMAGE   PreviewType = "image"
	PreviewTypeGEO     PreviewType = "geo"
	PreviewTypeGEO3D   PreviewType = "geo3d"
	PreviewTypeMODEL3D PreviewType = "model3d"
	PreviewTypeUNKNOWN PreviewType = "unknown"
)

func PreviewTypeFrom(p string) (PreviewType, bool) {
	switch PreviewType(p) {
	case PreviewTypeIMAGE:
		return PreviewTypeIMAGE, true
	case PreviewTypeGEO:
		return PreviewTypeGEO, true
	case PreviewTypeGEO3D:
		return PreviewTypeGEO3D, true
	case PreviewTypeMODEL3D:
		return PreviewTypeMODEL3D, true
	case PreviewTypeUNKNOWN:
		return PreviewTypeUNKNOWN, true
	default:
		return PreviewType(""), false
	}
}

func PreviewTypeFromRef(p *string) *PreviewType {
	if p == nil {
		return nil
	}
	var p2 PreviewType
	switch PreviewType(*p) {
	case PreviewTypeIMAGE:
		p2 = PreviewTypeIMAGE
	case PreviewTypeGEO:
		p2 = PreviewTypeGEO
	case PreviewTypeGEO3D:
		p2 = PreviewTypeGEO3D
	case PreviewTypeMODEL3D:
		p2 = PreviewTypeMODEL3D
	case PreviewTypeUNKNOWN:
		p2 = PreviewTypeUNKNOWN
	default:
		return nil
	}

	return &p2
}

func PreviewTypeFromContentType(c string) *PreviewType {
	if strings.HasPrefix(c, "image/") {
		return lo.ToPtr(PreviewTypeIMAGE)
	}
	return lo.ToPtr(PreviewTypeGEO)
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
