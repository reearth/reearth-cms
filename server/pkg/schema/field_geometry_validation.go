package schema

import (
	"encoding/json"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"golang.org/x/exp/slices"
)

var ErrUnsupportedType = rerror.NewE(i18n.T("unsupported geometry type"))

// isValidGeoJSON uses the go.geojson library to validate a GeoJSON string
func isValidGeoJSON(data string) (geojson.GeometryType, bool) {
	if len(strings.TrimSpace(data)) == 0 {
		return "", false
	}

	var raw map[string]interface{}
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
	case "Point", "MultiPoint":
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

//func (f *FieldGeometry) Validate(v *value.Value) (err error) {
//	v.Match(value.Match{
//		Geometry: func(a value.String) {
//			t, ok := isValidGeoJSON(a)
//			if !ok {
//				err = ErrInvalidValue
//			}
//			ok2 := f.SupportedTypes().Has(GeometrySupportedTypeFrom(string(t)))
//			if !ok2 {
//				err = ErrUnsupportedType
//			}
//		},
//		Default: func() {
//			err = ErrInvalidValue
//		},
//	})
//	return
//}
