package schema

import "strings"

type GeometrySupportedType string

const (
	GeometrySupportedTypePoint              GeometrySupportedType = "POINT"
	GeometrySupportedTypeMultiPoint         GeometrySupportedType = "MULTIPOINT"
	GeometrySupportedTypeLineString         GeometrySupportedType = "LINESTRING"
	GeometrySupportedTypeMultiLineString    GeometrySupportedType = "MULTILINESTRING"
	GeometrySupportedTypePolygon            GeometrySupportedType = "POLYGON"
	GeometrySupportedTypeMultiPolygon       GeometrySupportedType = "MULTIPOLYGON"
	GeometrySupportedTypeGeometryCollection GeometrySupportedType = "GEOMETRYCOLLECTION"
)

func (s GeometrySupportedType) String() string {
	return string(s)
}

func GeometrySupportedTypeFrom(s string) GeometrySupportedType {
	ss := strings.ToUpper(s)
	switch GeometrySupportedType(ss) {
	case GeometrySupportedTypePoint:
		return GeometrySupportedTypePoint
	case GeometrySupportedTypeMultiPoint:
		return GeometrySupportedTypeMultiPoint
	case GeometrySupportedTypeLineString:
		return GeometrySupportedTypeLineString
	case GeometrySupportedTypeMultiLineString:
		return GeometrySupportedTypeMultiLineString
	case GeometrySupportedTypePolygon:
		return GeometrySupportedTypePolygon
	case GeometrySupportedTypeMultiPolygon:
		return GeometrySupportedTypeMultiPolygon
	case GeometrySupportedTypeGeometryCollection:
		return GeometrySupportedTypeGeometryCollection

	default:
		return GeometrySupportedType("")
	}
}
