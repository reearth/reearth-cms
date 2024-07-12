package schema

import "strings"

type GeometryEditorSupportedType string

const (
	GeometryEditorSupportedTypePoint      GeometryEditorSupportedType = "POINT"
	GeometryEditorSupportedTypeLineString GeometryEditorSupportedType = "LINESTRING"
	GeometryEditorSupportedTypePolygon    GeometryEditorSupportedType = "POLYGON"
	GeometryEditorSupportedTypeAny        GeometryEditorSupportedType = "ANY"
)

func (s GeometryEditorSupportedType) String() string {
	return string(s)
}

func GeometryEditorSupportedTypeFrom(s string) GeometryEditorSupportedType {
	ss := strings.ToUpper(s)
	switch GeometryEditorSupportedType(ss) {
	case GeometryEditorSupportedTypePoint:
		return GeometryEditorSupportedTypePoint
	case GeometryEditorSupportedTypeLineString:
		return GeometryEditorSupportedTypeLineString
	case GeometryEditorSupportedTypePolygon:
		return GeometryEditorSupportedTypePolygon
	case GeometryEditorSupportedTypeAny:
		return GeometryEditorSupportedTypeAny

	default:
		return GeometryEditorSupportedType("")
	}
}
