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
)

// Validation rules of the unified Geometry field.
var (
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

var geometryStructureErrors = []error{
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

func isGeometryStructureError(err error) bool {
	return lo.ContainsBy(geometryStructureErrors, func(e error) bool {
		return errors.Is(err, e)
	})
}

func validateGeometry(g value.Geometry) error {
	b, err := json.Marshal(g)
	if err != nil {
		return ErrGeoFieldInvalidGeoStructure
	}
	if !isValidGeoJSONLimits(string(b)) {
		return ErrGeoFieldMaxSizeExceeded
	}
	return validateGeometryObject(g, false)
}

func validateGeometryObject(g map[string]any, inCollection bool) error {
	t, ok := g["type"].(string)
	if !ok {
		return ErrGeometryInvalidType
	}

	member := "coordinates"
	switch t {
	case "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon":
	case "GeometryCollection":
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

	c, ok := g[member].([]any)
	if !ok {
		return ErrGeometryInvalidCoordinates
	}

	switch t {
	case "Point":
		return validatePosition(c)
	case "MultiPoint":
		return validateEach(c, validatePosition)
	case "LineString":
		return validateLineString(c)
	case "MultiLineString":
		return validateEach(c, validateLineString)
	case "Polygon":
		return validatePolygon(c)
	case "MultiPolygon":
		return validateEach(c, validatePolygon)
	case "GeometryCollection":
		for _, m := range c {
			mg, ok := m.(map[string]any)
			if !ok {
				return ErrGeometryInvalidType
			}
			if err := validateGeometryObject(mg, true); err != nil {
				return err
			}
		}
	}
	return nil
}

// validateEach validates every element of l, which must be a list itself.
func validateEach(l []any, f func([]any) error) error {
	for _, e := range l {
		el, ok := e.([]any)
		if !ok {
			return ErrGeometryInvalidCoordinates
		}
		if err := f(el); err != nil {
			return err
		}
	}
	return nil
}

func validatePosition(p []any) error {
	if len(p) < 2 || len(p) > 3 {
		return ErrGeometryInvalidPosition
	}
	nums := make([]float64, 0, len(p))
	for _, n := range p {
		f, ok := n.(float64)
		if !ok || math.IsNaN(f) || math.IsInf(f, 0) {
			return ErrGeometryInvalidPosition
		}
		nums = append(nums, f)
	}

	lng, lat := nums[0], nums[1]
	if math.Abs(lng) > 180 {
		return ErrGeometryLongitudeOutOfRange
	}
	if math.Abs(lat) > 90 {
		// a valid position with longitude and latitude swapped
		if math.Abs(lat) <= 180 && math.Abs(lng) <= 90 {
			return ErrGeometryReversedCoordinates
		}
		return ErrGeometryLatitudeOutOfRange
	}
	return nil
}

func validateLineString(l []any) error {
	if len(l) < 2 {
		return ErrGeometryLineStringTooShort
	}
	return validateEach(l, validatePosition)
}

func validatePolygon(rings []any) error {
	return validateEach(rings, validateRing)
}

func validateRing(r []any) error {
	if len(r) < 4 {
		return ErrGeometryRingTooShort
	}
	if err := validateEach(r, validatePosition); err != nil {
		return err
	}
	first, _ := r[0].([]any)
	last, _ := r[len(r)-1].([]any)
	if !slices.Equal(first, last) {
		return ErrGeometryRingNotClosed
	}
	return nil
}
