package schema

import (
	"encoding/json"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"golang.org/x/exp/slices"
)

var ErrUnsupportedType = rerror.NewE(i18n.T("unsupported geometry type"))

type GeometrySupportedTypeList []GeometrySupportedType

func (l GeometrySupportedTypeList) Has(st GeometrySupportedType) bool {
	return slices.ContainsFunc(l, func(t GeometrySupportedType) bool {
		return t == st
	})
}

type FieldGeometry struct {
	st GeometrySupportedTypeList
}

func NewGeometry(supportedTypes GeometrySupportedTypeList) *FieldGeometry {
	return &FieldGeometry{
		st: supportedTypes,
	}
}

func (f *FieldGeometry) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:        f.Type(),
		geometry: f,
	}
}

func (f *FieldGeometry) SupportedTypes() GeometrySupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometry) Type() value.Type {
	return value.TypeGeometry
}

func (f *FieldGeometry) Clone() *FieldGeometry {
	if f == nil {
		return nil
	}
	return &FieldGeometry{
		st: f.SupportedTypes(),
	}
}

// IsValidGeoJSON uses the go.geojson library to validate a GeoJSON string
func IsValidGeoJSON(data string) (geojson.GeometryType, bool) {
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
		return t, err == nil && rfc7946Validation(g)

	case "GeometryCollection":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		v := true
		for _, geometry := range g.Geometries {
			v = v && rfc7946Validation(geometry)
		}
		return t, err == nil && v

	default:
		return "", false
	}
}
func rfc7946Validation(g *geojson.Geometry) bool {
	if g == nil {
		return false
	}
	b := true
	switch g.Type {
	case "Point", "MultiPoint":
		return true
	case "LineString":
		return len(g.LineString) > 1
	case "Polygon":
		for _, r := range g.Polygon {
			b = b && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
		}
		return b
	case "MultiLineString":
		for _, ls := range g.MultiLineString {
			b = b && len(ls) > 1
		}
	case "MultiPolygon":
		for _, polygon := range g.MultiPolygon {
			for _, r := range polygon {
				b = b && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
			}
		}
	}
	return false
}

func (f *FieldGeometry) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Geometry: func(a value.String) {
			t, ok := IsValidGeoJSON(a)
			if !ok {
				err = ErrInvalidValue
			}
			ok2 := f.SupportedTypes().Has(GeometrySupportedTypeFrom(string(t)))
			if !ok2 {
				err = ErrUnsupportedType
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometry) ValidateMultiple(v *value.Multiple) (err error) {
	return nil
}
