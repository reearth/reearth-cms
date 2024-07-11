package schema

import (
	"encoding/json"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type GeometryObjectSupportedTypeList []GeometryObjectSupportedType

type FieldGeometryObject struct {
	st GeometryObjectSupportedTypeList
}

func NewGeometryObject(supportedTypes GeometryObjectSupportedTypeList) *FieldGeometryObject {
	return &FieldGeometryObject{
		st: lo.Uniq(supportedTypes),
	}
}

func (f *FieldGeometryObject) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:              f.Type(),
		geometryObject: f,
	}
}

func (f *FieldGeometryObject) SupportedTypes() GeometryObjectSupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometryObject) Type() value.Type {
	return value.TypeGeometryObject
}

func (f *FieldGeometryObject) Clone() *FieldGeometryObject {
	if f == nil {
		return nil
	}
	return &FieldGeometryObject{
		st: f.SupportedTypes(),
	}
}

// IsValidGeometryObjectField uses the go.geojson library to validate the GeoJSON string inside the geometry object field
func IsValidGeometryObjectField(data string) bool {
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

func (f *FieldGeometryObject) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		GeometryObject: func(a value.String) {
			if !IsValidGeometryObjectField(a) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometryObject) ValidateMultiple(v *value.Multiple) (err error) {
	return nil
}
