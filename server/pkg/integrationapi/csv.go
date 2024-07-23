package integrationapi

import (
	"encoding/csv"
	"strconv"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var noPointFieldError = rerror.NewE(i18n.T("no point field in this model"))

func CSVFromItems(items item.VersionedList, s *schema.Schema) (string, error) {
	if !isPointFieldSupported(s) {
		return "", noPointFieldError
	}

	var data [][]string
	// keys
	keys := []string{"id", "location_lat", "location_lng"}
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})
	for _, f := range nonGeoFields {
		keys = append(keys, f.Name())
	}
	data = append(data, keys)
	// values
	for _, ver := range items {
		row, err := parseItem(ver.Value())
		if err == nil {
			data = append(data, row)
		}
	}
	// convert data to csv string
	var sb strings.Builder
	w := csv.NewWriter(&sb)
	for _, row := range data {
		if err := w.Write(row); err != nil {
			return "", err
		}
	}
	w.Flush()
	if err := w.Error(); err != nil {
		return "", err
	}

	return sb.String(), nil
}

func parseItem(itm *item.Item) ([]string, error) {
	geoFields := lo.Filter(itm.Fields(), func(f *item.Field, _ int) bool {
		return f.Type() == value.TypeGeometryObject || f.Type() == value.TypeGeometryEditor
	})
	nonGeoFields := lo.Filter(itm.Fields(), func(f *item.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})

	// get the first point field
	var geometry *Geometry
	for _, f := range geoFields {
		vv := f.Value().First()
		if vv != nil {
			ss, ok := vv.ValueString()
			if !ok {
				continue
			}
			g, err := StringToGeometry(ss)
			if err != nil {
				continue
			}
			if *g.Type == GeometryTypePoint {
				geometry = g
				break
			}
		}
	}
	if geometry == nil {
		return nil, noPointFieldError
	}
	c, err := geometry.Coordinates.AsPoint()
	if err != nil {
		return nil, err
	}
	id := itm.ID().String()
	lat := floatToString(c[0])
	lng := floatToString(c[1])
	row := []string{id, lat, lng}

	for _, f := range nonGeoFields {
		v, ok := toSingleString(f)
		if ok {
			row = append(row, v)
		}
	}

	return row, nil
}

func toSingleString(f *item.Field) (string, bool) {
	if f == nil {
		return "", false
	}

	switch f.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, ok := f.Value().First().ValueString()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeURL:
		v, ok := f.Value().First().ValueURL()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeAsset:
		v, ok := f.Value().First().ValueAsset()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeGroup:
		v, ok := f.Value().First().ValueGroup()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeReference:
		v, ok := f.Value().First().ValueReference()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeInteger:
		v, ok := f.Value().First().ValueInteger()
		if !ok {
			return "", false
		}
		return strconv.FormatInt(v, 10), true
	case value.TypeNumber:
		v, ok := f.Value().First().ValueNumber()
		if !ok {
			return "", false
		}
		return floatToString(v), true
	case value.TypeBool, value.TypeCheckbox:
		v, ok := f.Value().First().ValueBool()
		if !ok {
			return "", false
		}
		if v {
			return "true", true
		}
		return "false", true
	case value.TypeDateTime:
		v, ok := f.Value().First().ValueDateTime()
		if !ok {
			return "", false
		}
		return v.Format(time.RFC3339), true
	default:
		return "", false
	}
}

func floatToString(input_num float64) string {
	return strconv.FormatFloat(input_num, 'f', -1, 64)
}

func isPointFieldSupported(s *schema.Schema) bool {
	if s == nil {
		return false
	}
	for _, ff := range s.Fields() {
		var found bool
		ff.TypeProperty().Match(schema.TypePropertyMatch{
			GeometryObject: func(f *schema.FieldGeometryObject) {
				if f.SupportedTypes().Has(schema.GeometryObjectSupportedTypePoint) {
					found = true
				}
			},
			GeometryEditor: func(f *schema.FieldGeometryEditor) {
				if f.SupportedTypes().Has(schema.GeometryEditorSupportedTypePoint) {
					found = true
				}
			},
		})
		if found {
			return true
		}
	}
	return false
}
