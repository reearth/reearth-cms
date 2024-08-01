package integrationapi

import (
	"encoding/csv"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	noPointFieldError             = rerror.NewE(i18n.T("no point field in this model"))
	pointFieldIsNotSupportedError = rerror.NewE(i18n.T("point type is not supported in any geometry field in this model"))
)

func CSVFromItems(items item.VersionedList, s *schema.Schema) (string, error) {
	if !isPointFieldSupported(s) {
		return "", pointFieldIsNotSupportedError
	}

	keys, nonGeoFields := buildCSVHeaders(s)
	data := [][]string{}
	data = append(data, keys)
	for _, ver := range items {
		row, ok := parseItem(ver.Value(), nonGeoFields)
		if ok {
			data = append(data, row)
		}
	}

	csvString, err := convertToCSVString(data)
	if err != nil {
		return "", err
	}

	return csvString, nil
}

func buildCSVHeaders(s *schema.Schema) ([]string, []*schema.Field) {
	keys := []string{"id", "location_lat", "location_lng"}
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return !isGeometryField(f)
	})
	for _, f := range nonGeoFields {
		keys = append(keys, f.Name())
	}
	return keys, nonGeoFields
}

func parseItem(itm *item.Item, nonGeoFields []*schema.Field) ([]string, bool) {
	geoField, err := extractFirstPointField(itm)
	if err != nil {
		return nil, false
	}

	id := itm.ID().String()
	lat, lng := float64ToString(geoField[0]), float64ToString(geoField[1])
	row := []string{id, lat, lng}

	for _, sf := range nonGeoFields {
		f := itm.Field(sf.ID())
		v := toCSVProp(f)
		row = append(row, v)
	}

	return row, true
}

func extractFirstPointField(itm *item.Item) ([]float64, error) {
	geoFields := lo.Filter(itm.Fields(), func(f *item.Field, _ int) bool {
		return isGeometryFieldType(f.Type())
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

func toCSVProp(f *item.Field) string {
	if f == nil {
		return ""
	}

	vv := f.Value().First()
	if vv == nil {
		return ""
	}

	return toCSVValue(vv)
}

func isPointFieldSupported(s *schema.Schema) bool {
	if s == nil {
		return false
	}

	for _, f := range s.Fields() {
		if supportsPointField(f) {
			return true
		}
	}
	return false
}

func supportsPointField(f *schema.Field) bool {
	var supported bool
	f.TypeProperty().Match(schema.TypePropertyMatch{
		GeometryObject: func(f *schema.FieldGeometryObject) {
			supported = f.SupportedTypes().Has(schema.GeometryObjectSupportedTypePoint)
		},
		GeometryEditor: func(f *schema.FieldGeometryEditor) {
			supported = f.SupportedTypes().Has(schema.GeometryEditorSupportedTypePoint)
		},
	})
	return supported
}

func convertToCSVString(data [][]string) (string, error) {
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