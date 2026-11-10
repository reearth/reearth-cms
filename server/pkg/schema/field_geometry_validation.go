package schema

import (
	"encoding/json"
	"errors"
	"math"
	"slices"

	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"

	// TODO: use "github.com/reearth/reearth-cms/server/pkg/types"
	geojson "github.com/paulmach/go.geojson"
)

var (
	ErrUnsupportedType             = rerror.NewE(i18n.T("unsupported geometry type"))
	ErrGeoFieldMaxSizeExceeded     = rerror.NewE(i18n.T("Geo field max size exceeded"))
	ErrGeoFieldInvalidGeoStructure = rerror.NewE(i18n.T("invalid Geo field structure"))

	// errors of the Geometry field
	ErrGeometryInvalidType         = rerror.NewE(i18n.T("geometry type must be one of Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon or GeometryCollection"))
	ErrGeometryUnknownProperty     = rerror.NewE(i18n.T("geometry contains an unknown property"))
	ErrGeometryInvalidCoordinates  = rerror.NewE(i18n.T("geometry coordinates are invalid"))
	ErrGeometryInvalidPosition     = rerror.NewE(i18n.T("a position must be 2 or 3 finite numbers: longitude, latitude and optional altitude"))
	ErrGeometryLongitudeOutOfRange = rerror.NewE(i18n.T("longitude must be between -180 and 180"))
	ErrGeometryLatitudeOutOfRange  = rerror.NewE(i18n.T("latitude must be between -90 and 90"))
	ErrGeometryReversedCoordinates = rerror.NewE(i18n.T("coordinates seem to be in latitude, longitude order; positions must be in longitude, latitude order"))
	ErrGeometryLineStringTooShort  = rerror.NewE(i18n.T("a LineString must have at least 2 positions"))
	ErrGeometryRingTooShort        = rerror.NewE(i18n.T("a polygon ring must have at least 4 positions"))
	ErrGeometryRingNotClosed       = rerror.NewE(i18n.T("the first and last positions of a polygon ring must be equal"))
	ErrGeometryNestedCollection    = rerror.NewE(i18n.T("a GeometryCollection must not contain another GeometryCollection"))
)

// geoStructureErrors are reported with FieldValidationCodeInvalidGeoStructure.
var geoStructureErrors = []error{
	ErrGeoFieldInvalidGeoStructure,
	ErrGeometryInvalidType,
	ErrGeometryUnknownProperty,
	ErrGeometryInvalidCoordinates,
	ErrGeometryInvalidPosition,
	ErrGeometryLongitudeOutOfRange,
	ErrGeometryLatitudeOutOfRange,
	ErrGeometryReversedCoordinates,
	ErrGeometryLineStringTooShort,
	ErrGeometryRingTooShort,
	ErrGeometryRingNotClosed,
	ErrGeometryNestedCollection,
}

func isGeoStructureError(err error) bool {
	return lo.ContainsBy(geoStructureErrors, func(e error) bool {
		return errors.Is(err, e)
	})
}

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
func validateGeometry(g value.Geometry) error {
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
	gg, err := geojson.UnmarshalGeometry(b)
	if err != nil {
		return ErrGeometryInvalidCoordinates
	}
	return validateGeometryCoordinates(gg)
}

// validateGeometryMembers checks the type and the members of g: "type" and either "coordinates" or "geometries".
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
		if k != "type" && k != member {
			return ErrGeometryUnknownProperty
		}
	}
	if _, ok := g[member]; !ok {
		return ErrGeometryInvalidCoordinates
	}

	members, _ := g["geometries"].([]any)
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
		return validateAll(g.MultiPoint, validatePosition)
	case geojson.GeometryLineString:
		return validateLineString(g.LineString)
	case geojson.GeometryMultiLineString:
		return validateAll(g.MultiLineString, validateLineString)
	case geojson.GeometryPolygon:
		return validatePolygon(g.Polygon)
	case geojson.GeometryMultiPolygon:
		return validateAll(g.MultiPolygon, validatePolygon)
	case geojson.GeometryCollection:
		return validateAll(g.Geometries, validateGeometryCoordinates)
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
	return validateAll(rings, validateRing)
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
