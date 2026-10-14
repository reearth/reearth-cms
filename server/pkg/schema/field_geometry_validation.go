package schema

import (
	"encoding/json"
	"slices"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"

	// TODO: use "github.com/reearth/reearth-cms/server/pkg/types"
	geojson "github.com/paulmach/go.geojson"
)

var (
	ErrUnsupportedType             = rerror.NewE(i18n.T("unsupported geometry type"))
	ErrGeoFieldMaxSizeExceeded     = rerror.NewE(i18n.T("Geo field max size exceeded"))
	ErrGeoFieldInvalidGeoStructure = rerror.NewE(i18n.T("invalid Geo field structure"))
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
	var t geojson.GeometryType
	switch geoType {
	case "Point", "MultiPoint", "LineString", "Polygon", "MultiLineString", "MultiPolygon":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		return t, err == nil && isValidRFC7946(g)

	case "GeometryCollection":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		v := true
		for _, geometry := range g.Geometries {
			v = v && isValidRFC7946(geometry)
		}
		return t, err == nil && v

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
