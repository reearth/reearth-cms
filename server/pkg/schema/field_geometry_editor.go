package schema

import (
	"encoding/json"
	"strings"

	geojson "github.com/paulmach/go.geojson"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
	"golang.org/x/exp/slices"
)

type GeometryEditorSupportedTypeList []GeometryEditorSupportedType

type FieldGeometryEditor struct {
	st GeometryEditorSupportedTypeList
}

func NewGeometryEditor(supportedTypes GeometryEditorSupportedTypeList) *FieldGeometryEditor {
	return &FieldGeometryEditor{
		st: lo.Uniq(supportedTypes),
	}
}

func (f *FieldGeometryEditor) TypeProperty() *TypeProperty {
	return &TypeProperty{
		t:              f.Type(),
		geometryEditor: f,
	}
}

func (f *FieldGeometryEditor) SupportedTypes() GeometryEditorSupportedTypeList {
	return slices.Clone(f.st)
}

func (f *FieldGeometryEditor) Type() value.Type {
	return value.TypeGeometryEditor
}

func (f *FieldGeometryEditor) Clone() *FieldGeometryEditor {
	if f == nil {
		return nil
	}
	return &FieldGeometryEditor{
		st: f.SupportedTypes(),
	}
}

// IsValidGeometryEditorField uses the go.geojson library to validate the GeoJSON string inside the geometry editor field
func IsValidGeometryEditorField(data string) bool {
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
	case "Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon", "GeometryEditorCollection":
		_, err := geojson.UnmarshalGeometry([]byte(data))
		return err == nil
	default:
		return false
	}
}

func (f *FieldGeometryEditor) Validate(v *value.Value) (err error) {
	v.Match(value.Match{
		GeometryEditor: func(a value.String) {
			if !IsValidGeometryEditorField(a) {
				err = ErrInvalidValue
			}
		},
		Default: func() {
			err = ErrInvalidValue
		},
	})
	return
}

func (f *FieldGeometryEditor) ValidateMultiple(v *value.Multiple) (err error) {
	return nil
}
