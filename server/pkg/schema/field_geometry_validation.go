package schema

import (
	"encoding/json"
	"math"
	"slices"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"

	// go.geojson rejects non-numeric and null coordinates, which pkg/types would decode as 0
	geojson "github.com/paulmach/go.geojson"
)

var (
	ErrUnsupportedType             = rerror.NewE(i18n.T("unsupported geometry type"))
	ErrGeoFieldMaxSizeExceeded     = rerror.NewE(i18n.T("Geo field max size exceeded"))
	ErrGeoFieldInvalidGeoStructure = rerror.NewE(i18n.T("invalid Geo field structure"))

	// errors of the Geometry field
	// They wrap ErrGeoFieldInvalidGeoStructure, so they are all reported with FieldValidationCodeInvalidGeoStructure.
	ErrGeometryInvalidType         = rerror.WrapE(i18n.T("geometry type must be one of Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon or GeometryCollection"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryUnknownProperty     = rerror.WrapE(i18n.T("geometry contains an unknown property"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryInvalidCoordinates  = rerror.WrapE(i18n.T("geometry coordinates are invalid"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryInvalidGeometries   = rerror.WrapE(i18n.T("a GeometryCollection must have a list of geometries"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryInvalidPosition     = rerror.WrapE(i18n.T("a position must be 2 or 3 finite numbers: longitude, latitude and optional altitude"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryLongitudeOutOfRange = rerror.WrapE(i18n.T("longitude must be between -180 and 180"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryLatitudeOutOfRange  = rerror.WrapE(i18n.T("latitude must be between -90 and 90"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryReversedCoordinates = rerror.WrapE(i18n.T("latitude must be between -90 and 90; longitude and latitude may be swapped"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryLineStringTooShort  = rerror.WrapE(i18n.T("a LineString must have at least 2 positions"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryRingTooShort        = rerror.WrapE(i18n.T("a polygon ring must have at least 4 positions"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryRingNotClosed       = rerror.WrapE(i18n.T("the first and last positions of a polygon ring must be equal"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryNestedCollection    = rerror.WrapE(i18n.T("a GeometryCollection must not contain another GeometryCollection"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryEmpty               = rerror.WrapE(i18n.T("a geometry must not be empty"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryInvalidBBox         = rerror.WrapE(i18n.T("a bbox must be 4 numbers, or 6 when the coordinates have an altitude"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryBBoxOutOfRange      = rerror.WrapE(i18n.T("a bbox must have longitudes between -180 and 180, latitudes between -90 and 90, and south and minimum altitude not greater than north and maximum altitude"), ErrGeoFieldInvalidGeoStructure)
	ErrGeometryBBoxNotContaining   = rerror.WrapE(i18n.T("a bbox must contain every position of its geometry"), ErrGeoFieldInvalidGeoStructure)
)

const maxGeoFieldBytes = 10 * 1024

func validateGeoJSON(data string) (geojson.GeometryType, error) {
	if !isValidGeoJSONLimits(data) {
		return "", ErrGeoFieldMaxSizeExceeded
	}
	t, ok := isValidGeoJSON(data)
	if !ok {
		return "", ErrGeoFieldInvalidGeoStructure
	}
	return t, nil
}

func isValidGeoJSONLimits(data string) bool {
	return len(data) <= maxGeoFieldBytes
}

func isValidGeoJSON(data string) (geojson.GeometryType, bool) {
	var raw map[string]any
	if err := json.Unmarshal([]byte(data), &raw); err != nil {
		return "", false
	}

	geoType, ok := raw["type"].(string)
	if !ok {
		return "", false
	}
	switch geoType {
	case "Point", "MultiPoint", "LineString", "Polygon", "MultiLineString", "MultiPolygon":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if err != nil {
			return "", false
		}
		return g.Type, isValidRFC7946(g)

	case "GeometryCollection":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if err != nil {
			return "", false
		}
		v := true
		for _, geometry := range g.Geometries {
			v = v && isValidRFC7946(geometry)
		}
		return g.Type, v

	default:
		return "", false
	}
}

func isValidPosition(pos []float64) bool {
	l := len(pos)
	return l > 1 && l < 4
}

func isValidRFC7946(g *geojson.Geometry) bool {
	if g == nil {
		return false
	}
	b := true
	switch g.Type {
	case "Point":
		return isValidPosition(g.Point)
	case "LineString":
		b = len(g.LineString) > 1
		for _, fl := range g.LineString {
			b = b && isValidPosition(fl)
		}
		return b
	case "Polygon":
		for _, r := range g.Polygon {
			b = b && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
			for _, fl := range r {
				b = b && isValidPosition(fl)
			}
		}
		return b
	case "MultiLineString":
		for _, ls := range g.MultiLineString {
			b = b && len(ls) > 1
			for _, fl := range ls {
				b = b && isValidPosition(fl)
			}
		}
		return b
	case "MultiPoint":
		for _, fl := range g.MultiPoint {
			b = b && isValidPosition(fl)
		}
		return b
	case "MultiPolygon":
		for _, polygon := range g.MultiPolygon {
			for _, r := range polygon {
				b = b && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
				for _, fl := range r {
					b = b && isValidPosition(fl)
				}
			}
		}
		return b
	}
	return false
}

// validateGeometry validates a value of the Geometry field.
func validateGeometry(g value.Json) error {
	b, err := json.Marshal(g)
	if err != nil {
		return ErrGeoFieldInvalidGeoStructure
	}
	if !isValidGeoJSONLimits(string(b)) {
		return ErrGeoFieldMaxSizeExceeded
	}
	if err := validateGeometryMembers(g, false); err != nil {
		return err
	}
	gg, ok := toGeoJSONGeometry(g)
	if !ok {
		return ErrGeometryInvalidCoordinates
	}
	if err := validateGeometryCoordinates(gg); err != nil {
		return err
	}
	return validateGeometryBBoxes(g, gg)
}

// toGeoJSONGeometry converts g, whose members are already validated, to a geojson.Geometry.
// It returns false if any coordinate is not a number or a list is not nested as the type requires.
func toGeoJSONGeometry(g map[string]any) (*geojson.Geometry, bool) {
	t, _ := g["type"].(string)
	gg := &geojson.Geometry{Type: geojson.GeometryType(t)}
	c := g["coordinates"]
	ok := true
	switch gg.Type {
	case geojson.GeometryPoint:
		gg.Point, ok = toPosition(c)
	case geojson.GeometryMultiPoint:
		gg.MultiPoint, ok = toList(c, toPosition)
	case geojson.GeometryLineString:
		gg.LineString, ok = toList(c, toPosition)
	case geojson.GeometryMultiLineString:
		gg.MultiLineString, ok = toList(c, toPositions)
	case geojson.GeometryPolygon:
		gg.Polygon, ok = toList(c, toPositions)
	case geojson.GeometryMultiPolygon:
		gg.MultiPolygon, ok = toList(c, toRings)
	case geojson.GeometryCollection:
		gg.Geometries, ok = toList(g["geometries"], func(m any) (*geojson.Geometry, bool) {
			mg, _ := m.(map[string]any)
			return toGeoJSONGeometry(mg)
		})
	}
	return gg, ok
}

func toPosition(v any) ([]float64, bool) {
	return toList(v, func(n any) (float64, bool) {
		f, ok := n.(float64)
		return f, ok
	})
}

func toPositions(v any) ([][]float64, bool) {
	return toList(v, toPosition)
}

func toRings(v any) ([][][]float64, bool) {
	return toList(v, toPositions)
}

func toList[T any](v any, convert func(any) (T, bool)) ([]T, bool) {
	l, ok := v.([]any)
	if !ok {
		return nil, false
	}
	res := make([]T, 0, len(l))
	for _, e := range l {
		c, ok := convert(e)
		if !ok {
			return nil, false
		}
		res = append(res, c)
	}
	return res, true
}

// validateGeometryMembers checks the type and the members of g: "type", either "coordinates" or "geometries", and an optional "bbox".
func validateGeometryMembers(g map[string]any, inCollection bool) error {
	t, _ := g["type"].(string)
	member := "coordinates"
	switch geojson.GeometryType(t) {
	case geojson.GeometryPoint, geojson.GeometryMultiPoint,
		geojson.GeometryLineString, geojson.GeometryMultiLineString,
		geojson.GeometryPolygon, geojson.GeometryMultiPolygon:
	case geojson.GeometryCollection:
		if inCollection {
			return ErrGeometryNestedCollection
		}
		member = "geometries"
	default:
		return ErrGeometryInvalidType
	}

	for k := range g {
		if k != "type" && k != member && k != "bbox" {
			return ErrGeometryUnknownProperty
		}
	}
	if member == "coordinates" {
		if _, ok := g[member]; !ok {
			return ErrGeometryInvalidCoordinates
		}
		return nil
	}

	members, ok := g["geometries"].([]any)
	if !ok {
		return ErrGeometryInvalidGeometries
	}
	for _, m := range members {
		mg, ok := m.(map[string]any)
		if !ok {
			return ErrGeometryInvalidType
		}
		if err := validateGeometryMembers(mg, true); err != nil {
			return err
		}
	}
	return nil
}

func validateGeometryCoordinates(g *geojson.Geometry) error {
	switch g.Type {
	case geojson.GeometryPoint:
		return validatePosition(g.Point)
	case geojson.GeometryMultiPoint:
		return validateParts(g.MultiPoint, validatePosition)
	case geojson.GeometryLineString:
		return validateLineString(g.LineString)
	case geojson.GeometryMultiLineString:
		return validateParts(g.MultiLineString, validateLineString)
	case geojson.GeometryPolygon:
		return validatePolygon(g.Polygon)
	case geojson.GeometryMultiPolygon:
		return validateParts(g.MultiPolygon, validatePolygon)
	case geojson.GeometryCollection:
		return validateParts(g.Geometries, validateGeometryCoordinates)
	}
	return nil
}

func validatePosition(p []float64) error {
	if len(p) < 2 || len(p) > 3 {
		return ErrGeometryInvalidPosition
	}
	lng, lat := p[0], p[1]
	if math.Abs(lng) > 180 {
		return ErrGeometryLongitudeOutOfRange
	}
	if math.Abs(lat) > 90 {
		// the position would be valid with longitude and latitude swapped
		if math.Abs(lat) <= 180 && math.Abs(lng) <= 90 {
			return ErrGeometryReversedCoordinates
		}
		return ErrGeometryLatitudeOutOfRange
	}
	return nil
}

func validateLineString(l [][]float64) error {
	if len(l) < 2 {
		return ErrGeometryLineStringTooShort
	}
	return validateAll(l, validatePosition)
}

func validatePolygon(rings [][][]float64) error {
	return validateParts(rings, validateRing)
}

// validateParts validates the parts of a geometry, which must have at least one part.
func validateParts[T any](parts []T, validate func(T) error) error {
	if len(parts) == 0 {
		return ErrGeometryEmpty
	}
	return validateAll(parts, validate)
}

func validateRing(r [][]float64) error {
	if len(r) < 4 {
		return ErrGeometryRingTooShort
	}
	if err := validateAll(r, validatePosition); err != nil {
		return err
	}
	if !slices.Equal(r[0], r[len(r)-1]) {
		return ErrGeometryRingNotClosed
	}
	return nil
}

func validateAll[T any](l []T, validate func(T) error) error {
	for _, e := range l {
		if err := validate(e); err != nil {
			return err
		}
	}
	return nil
}

// validateGeometryBBoxes validates the bbox of g, and those of the members of a GeometryCollection, against their positions (RFC 7946 §5).
// g has valid coordinates, and gg is its converted form.
func validateGeometryBBoxes(g map[string]any, gg *geojson.Geometry) error {
	if b, ok := g["bbox"]; ok {
		if err := validateBBox(b, geometryPositions(gg)); err != nil {
			return err
		}
	}
	members, _ := g["geometries"].([]any)
	for i, m := range members {
		mg, _ := m.(map[string]any)
		if err := validateGeometryBBoxes(mg, gg.Geometries[i]); err != nil {
			return err
		}
	}
	return nil
}

// validateBBox validates a bbox: [west, south, east, north], or [west, south, min altitude, east, north, max altitude].
// It has 4 numbers when no position has an altitude, 6 when every position has one, and either when only some have one.
// West may be greater than east when the bbox crosses the antimeridian (RFC 7946 §5.2).
func validateBBox(raw any, positions [][]float64) error {
	bbox, ok := toPosition(raw)
	if !ok {
		return ErrGeometryInvalidBBox
	}
	withAltitude := lo.CountBy(positions, func(p []float64) bool { return len(p) == 3 })
	switch {
	case len(bbox) == 4 && withAltitude < len(positions):
	case len(bbox) == 6 && withAltitude > 0:
	default:
		return ErrGeometryInvalidBBox
	}

	n := len(bbox) / 2
	west, south, east, north := bbox[0], bbox[1], bbox[n], bbox[n+1]
	if math.Abs(west) > 180 || math.Abs(east) > 180 || math.Abs(south) > 90 || math.Abs(north) > 90 ||
		south > north || n == 3 && bbox[2] > bbox[5] {
		return ErrGeometryBBoxOutOfRange
	}

	crossesAntimeridian := west > east
	for _, p := range positions {
		lng, lat := p[0], p[1]
		inLng := lng >= west && lng <= east
		if crossesAntimeridian {
			inLng = lng >= west || lng <= east
		}
		if !inLng || lat < south || lat > north || n == 3 && len(p) == 3 && (p[2] < bbox[2] || p[2] > bbox[5]) {
			return ErrGeometryBBoxNotContaining
		}
	}
	return nil
}

// geometryPositions returns every position of g, including those of the members of a GeometryCollection.
func geometryPositions(g *geojson.Geometry) [][]float64 {
	switch g.Type {
	case geojson.GeometryPoint:
		return [][]float64{g.Point}
	case geojson.GeometryMultiPoint:
		return g.MultiPoint
	case geojson.GeometryLineString:
		return g.LineString
	case geojson.GeometryMultiLineString:
		return slices.Concat(g.MultiLineString...)
	case geojson.GeometryPolygon:
		return slices.Concat(g.Polygon...)
	case geojson.GeometryMultiPolygon:
		var res [][]float64
		for _, p := range g.MultiPolygon {
			res = append(res, slices.Concat(p...)...)
		}
		return res
	case geojson.GeometryCollection:
		var res [][]float64
		for _, m := range g.Geometries {
			res = append(res, geometryPositions(m)...)
		}
		return res
	}
	return nil
}
