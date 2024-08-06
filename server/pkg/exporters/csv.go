package exporters

import (
	"encoding/csv"
	"io"
	"strconv"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	noPointFieldError             = rerror.NewE(i18n.T("no point field in this model"))
	pointFieldIsNotSupportedError = rerror.NewE(i18n.T("point type is not supported in any geometry field in this model"))
)

func CSVFromItems(pw *io.PipeWriter, items item.VersionedList, s *schema.Schema) error {
	if !s.IsPointFieldSupported() {
		return pointFieldIsNotSupportedError
	}

	w := csv.NewWriter(pw)
	go func() {
		defer pw.Close()

		keys, nonGeoFields := buildCSVHeaders(s)
		if err := w.Write(keys); err != nil {
			pw.CloseWithError(err)
			return
		}
		for _, ver := range items {
			row, ok := rowFromItem(ver.Value(), nonGeoFields)
			if ok {
				if err := w.Write(row); err != nil {
					pw.CloseWithError(err)
					return
				}
			}
		}
		w.Flush()
		if err := w.Error(); err != nil {
			pw.CloseWithError(err)
		}
	}()

	return nil
}

func buildCSVHeaders(s *schema.Schema) ([]string, []*schema.Field) {
	keys := []string{"id", "location_lat", "location_lng"}
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return !f.IsGeometryField()
	})
	for _, f := range nonGeoFields {
		keys = append(keys, f.Name())
	}
	return keys, nonGeoFields
}

func rowFromItem(itm *item.Item, nonGeoFields []*schema.Field) ([]string, bool) {
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
	geoFields := lo.Filter(itm.Fields(), func(f *item.Field, _ int) bool {
		return f.Type().IsGeometryFieldType()
	})

	for _, f := range geoFields {
		ss, ok := f.Value().First().ValueString()
		if !ok {
			continue
		}
		g, err := StringToGeometry(ss)
		if err != nil || g == nil {
			continue
		}
		if *g.Type != GeometryTypePoint {
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
	if vv == nil {
		return ""
	}
	return ToCSVValue(vv)
}

func ToCSVValue(vv *value.Value) string {
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
