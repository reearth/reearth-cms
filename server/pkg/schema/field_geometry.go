package schema

import (
	"encoding/json"
	"errors"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/exp/slices"
)

var ErrUnsupportedType = errors.New("unsupported geometry type")

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
	case "Point", "GeometryCollection", "MultiPoint":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		return t, err == nil
	case "LineString":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		return t, err == nil && len(g.LineString) > 1
	case "Polygon":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		v := true
		for _, r := range g.Polygon {
			v = v && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
		}

		return t, err == nil && v
	case "MultiLineString":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		v := true
		for _, ls := range g.MultiLineString {
			v = v && len(ls) > 1
		}
		return t, err == nil && v
	case "MultiPolygon":
		g, err := geojson.UnmarshalGeometry([]byte(data))
		if g != nil {
			t = g.Type
		}
		v := true
		for _, polygon := range g.MultiPolygon {
			for _, r := range polygon {
				v = v && len(r) > 3 && slices.Equal(r[0], r[len(r)-1])
			}
		}

		return t, err == nil && v
	default:
		return "", false
	}
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
