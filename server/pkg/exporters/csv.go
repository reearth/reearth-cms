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
	lat, lng := float64ToString(geoField[0]), float64ToString(geoField[1])
	row := []string{id, lat, lng}

	for _, sf := range nonGeoFields {
		f := itm.Field(sf.ID())
		v := ToCSVProp(f)
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
		g, err := StringToGeometry(ss)
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

func ToCSVProp(f *item.Field) string {
	if f == nil {
		return ""
	}
	vv := f.Value().First()
	return ToCSVValue(vv)
}

func ToCSVValue(vv *value.Value) string {
	if vv == nil {
		return ""
	}

	switch vv.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, _ := vv.ValueString()
		return v
	case value.TypeURL:
		v, _ := vv.ValueURL()
		if v != nil {
			return v.String()
		}
	case value.TypeInteger:
		v, _ := vv.ValueInteger()
		return strconv.FormatInt(v, 10)
	case value.TypeNumber:
		v, _ := vv.ValueNumber()
		return strconv.FormatFloat(v, 'f', -1, 64)
	case value.TypeBool, value.TypeCheckbox:
		v, _ := vv.ValueBool()
		return strconv.FormatBool(v)
	case value.TypeDateTime:
		v, _ := vv.ValueDateTime()
		if !v.IsZero() {
			return v.Format(time.RFC3339)
		}
	}
	return ""
}
