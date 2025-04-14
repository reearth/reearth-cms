package exporters

import (
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

var (
	noPointFieldError = rerror.NewE(i18n.T("no point field in this model"))
)

func BuildCSVHeaders(s *schema.Schema) []string {
	keys := []string{"id", "location_lat", "location_lng"}
	for _, f := range s.Fields() {
		if !f.IsGeometryField() {
			keys = append(keys, f.Name())
		}
	}
	return keys
}

func RowFromItem(itm *item.Item, nonGeoFields []*schema.Field) ([]string, bool) {
	geoField, err := extractFirstPointField(itm)
	if err != nil {
		return nil, false
	}

	id := itm.ID().String()
	lat, lng := float64ToString(geoField[1]), float64ToString(geoField[0])
	row := []string{id, lat, lng}

	for _, sf := range nonGeoFields {
		f := itm.Field(sf.ID())
		v := toCSVProp(f)
		row = append(row, v)
	}

	return row, true
}

func extractFirstPointField(itm *item.Item) ([]float64, error) {
	for _, f := range itm.Fields() {
		if !f.Type().IsGeometryFieldType() {
			continue
		}
		ss, ok := f.Value().First().ValueString()
		if !ok {
			continue
		}
		g, err := stringToGeometry(ss)
		if err != nil || g == nil || g.Type == nil || *g.Type != GeometryTypePoint {
			continue
		}
		return g.Coordinates.AsPoint()
	}
	return nil, noPointFieldError
}

func float64ToString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}

func toCSVProp(f *item.Field) string {
	if f == nil {
		return ""
	}
	vv := f.Value().First()
	return toCSVValue(vv)
}

func toCSVValue(vv *value.Value) string {
	if vv == nil {
		return ""
	}

	switch vv.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return ""
		}
		return v
	case value.TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return ""
		}
		return v.String()
	case value.TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return ""
		}
		return strconv.FormatInt(v, 10)
	case value.TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return ""
		}
		return strconv.FormatFloat(v, 'f', -1, 64)
	case value.TypeBool, value.TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return ""
		}
		return strconv.FormatBool(v)
	case value.TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return ""
		}
		return v.Format(time.RFC3339)
	default:
		return ""
	}
}
