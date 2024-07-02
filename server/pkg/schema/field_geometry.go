package schema

import (
	"encoding/json"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"golang.org/x/exp/slices"
)

type GeometrySupportedTypeList []GeometrySupportedType

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
func IsValidGeoJSON(data string) bool {
	if len(strings.TrimSpace(data)) == 0 {
		return false
	}

	var raw map[string]interface{}
	if err := json.Unmarshal([]byte(data), &raw); err != nil {
		return false
	}

	geoType, ok := raw["type"].(string)
	if !ok {
		return false
	}

	switch geoType {
	case "Feature":
		_, err := geojson.UnmarshalFeature([]byte(data))
		return err == nil
	case "Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryCollection":
		_, err := geojson.UnmarshalGeometry([]byte(data))
		return err == nil
	default:
		return false
	}
}

func (f *FieldGeometry) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		Geometry: func(a value.String) {
			if !IsValidGeoJSON(a) {
				err = ErrInvalidValue
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
