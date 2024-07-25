package integrationapi

import (
	"encoding/json"
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

func toSingleValue(vv *value.Value) (string, bool) {
	if vv == nil {
		return "", false
	}

	switch vv.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeAsset:
		v, ok := vv.ValueAsset()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeGroup:
		v, ok := vv.ValueGroup()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeReference:
		v, ok := vv.ValueReference()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return "", false
		}
		return int64ToString(v), true
	case value.TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return "", false
		}
		return float64ToString(v), true
	case value.TypeBool, value.TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return "", false
		}
		return boolToString(v), true
	case value.TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return "", false
		}
		return v.Format(time.RFC3339), true
	default:
		return "", false
	}
}

func toMultipleValues(vv []*value.Value) ([]string, bool) {
	if len(vv) == 0 {
		return nil, false
	}
	return lo.FilterMap(vv, func(v *value.Value, _ int) (string, bool) {
		return toSingleValue(v)
	}), true
}

func isGeometryField(f *schema.Field) bool {
	return f.Type() == value.TypeGeometryObject || f.Type() == value.TypeGeometryEditor
}

func isGeometryFieldType(t value.Type) bool {
	return t == value.TypeGeometryObject || t == value.TypeGeometryEditor
}

func float64ToString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}

func int64ToString(i int64) string {
	return strconv.FormatInt(i, 10)
}

func boolToString(b bool) string {
	return strconv.FormatBool(b)
}

func hasGeometryFields(s *schema.Schema) bool {
	if s == nil {
		return false
	}
	hasObject := len(s.FieldsByType(value.TypeGeometryObject)) > 0
	hasEditor := len(s.FieldsByType(value.TypeGeometryEditor)) > 0
	return hasObject || hasEditor
}

func StringToGeometry(geoString string) (*Geometry, error) {
	var geometry Geometry
	if err := json.Unmarshal([]byte(geoString), &geometry); err != nil {
		return nil, err
	}
	return &geometry, nil
}
