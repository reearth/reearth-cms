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
	pointFieldIsNotSupportedError = rerror.NewE(i18n.T("point field is not supported"))
)

func CSVFromItems(items item.VersionedList, s *schema.Schema) (string, error) {
	if !isPointFieldSupported(s) {
		return "", pointFieldIsNotSupportedError
	}

	keys, data := buildCSVHeaders(s), [][]string{}
	data = append(data, keys)

	for _, ver := range items {
		row, err := parseItem(ver.Value())
		if err == nil {
			data = append(data, row)
		}
	}

	csvString, err := convertToCSVString(data)
	if err != nil {
		return "", err
	}

	return csvString, nil
}

func buildCSVHeaders(s *schema.Schema) []string {
	keys := []string{"id", "location_lat", "location_lng"}
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return !isGeometryField(f)
	})

	for _, f := range nonGeoFields {
		keys = append(keys, f.Name())
	}
	return keys
}

func parseItem(itm *item.Item) ([]string, error) {
	geoField, err := extractFirstPointField(itm)
	if err != nil {
		return nil, err
	}

	id := itm.ID().String()
	lat, lng := floatToString(geoField[0]), floatToString(geoField[1])
	row := []string{id, lat, lng}

	nonGeoFields := lo.Filter(itm.Fields(), func(f *item.Field, _ int) bool {
		return !isGeometryFieldType(f.Type())
	})

	for _, f := range nonGeoFields {
		v, ok := toCSVProp(f)
		if ok {
			row = append(row, v)
		}
	}

	return row, nil
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

func toCSVProp(f *item.Field) (string, bool) {
	if f == nil {
		return "", false
	}

	vv := f.Value().First()
	if vv == nil {
		return "", false
	}

	return toSingleValue(vv)
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
