package schema

import "strings"

type GeometryObjectSupportedType string

const (
	GeometryObjectSupportedTypePoint              GeometryObjectSupportedType = "POINT"
	GeometryObjectSupportedTypeMultiPoint         GeometryObjectSupportedType = "MULTIPOINT"
	GeometryObjectSupportedTypeLineString         GeometryObjectSupportedType = "LINESTRING"
	GeometryObjectSupportedTypeMultiLineString    GeometryObjectSupportedType = "MULTILINESTRING"
	GeometryObjectSupportedTypePolygon            GeometryObjectSupportedType = "POLYGON"
	GeometryObjectSupportedTypeMultiPolygon       GeometryObjectSupportedType = "MULTIPOLYGON"
	GeometryObjectSupportedTypeGeometryCollection GeometryObjectSupportedType = "GEOMETRYCOLLECTION"
)

func (s GeometryObjectSupportedType) String() string {
	return string(s)
}

func GeometryObjectSupportedTypeFrom(s string) GeometryObjectSupportedType {
	ss := strings.ToUpper(s)
	switch GeometryObjectSupportedType(ss) {
	case GeometryObjectSupportedTypePoint:
		return GeometryObjectSupportedTypePoint
	case GeometryObjectSupportedTypeMultiPoint:
		return GeometryObjectSupportedTypeMultiPoint
	case GeometryObjectSupportedTypeLineString:
		return GeometryObjectSupportedTypeLineString
	case GeometryObjectSupportedTypeMultiLineString:
		return GeometryObjectSupportedTypeMultiLineString
	case GeometryObjectSupportedTypePolygon:
		return GeometryObjectSupportedTypePolygon
	case GeometryObjectSupportedTypeMultiPolygon:
		return GeometryObjectSupportedTypeMultiPolygon
	case GeometryObjectSupportedTypeGeometryCollection:
		return GeometryObjectSupportedTypeGeometryCollection

	default:
		return GeometryObjectSupportedType("")
	}
}

func GeometryAllSupportedTypes() GeometryObjectSupportedTypeList {
	return GeometryObjectSupportedTypeList{
		GeometryObjectSupportedTypePoint,
		GeometryObjectSupportedTypeMultiPoint,
		GeometryObjectSupportedTypeLineString,
		GeometryObjectSupportedTypeMultiLineString,
		GeometryObjectSupportedTypePolygon,
		GeometryObjectSupportedTypeMultiPolygon,
		GeometryObjectSupportedTypeGeometryCollection,
	}
}
