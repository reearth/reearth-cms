package schema

import (
	"encoding/json"
	"math"
	"slices"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	ErrGeoFieldMaxSizeExceeded     = rerror.NewE(i18n.T("Geo field max size exceeded"))
	ErrGeoFieldInvalidGeoStructure = rerror.NewE(i18n.T("invalid Geo field structure"))

	// errors of the Geometry field
	// They wrap ErrGeoFieldInvalidGeoStructure, so they are all reported with FieldValidationCodeInvalidGeoStructure.
	ErrGeometryInvalidType         = rerror.WrapE(i18n.T("geometry type must be one of Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon or GeometryCollection"), ErrGeoFieldInvalidGeoStructure)
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
)

const maxGeoFieldBytes = 10 * 1024

// validateGeometry validates a value of the Geometry field.
func validateGeometry(g value.Json) error {
	b, err := json.Marshal(g)
	if err != nil {
		return ErrGeoFieldInvalidGeoStructure
	}
	if len(b) > maxGeoFieldBytes {
		return ErrGeoFieldMaxSizeExceeded
	}
	if err := validateGeometryMembers(g, false); err != nil {
		return err
	}
	gg, ok := toGeoJSONGeometry(g)
	if !ok {
		return ErrGeometryInvalidCoordinates
	}
	return validateGeometryCoordinates(gg)
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

// validateGeometryMembers checks the type of g and that it has "coordinates", or "geometries" for a GeometryCollection.
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

	// other members were removed when the value was created (see value.TypeGeometry)
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
