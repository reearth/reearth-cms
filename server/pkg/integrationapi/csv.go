package integrationapi

import (
	"encoding/csv"
	"strconv"
	"strings"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var noPointFieldError = rerror.NewE(i18n.T("no point field in this model"))

func CSVFromItems(items item.VersionedList, s *schema.Schema) (string, error) {
	var data [][]string
	// keys
	keys := []string{"id", "location_lat", "location_lng"}
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})
	for _, f := range nonGeoFields {
		keys = append(keys, f.Key().String())
	}
	data = append(data, keys)
	// values
	for _, ver := range items {
		row, err := parseItem(ver.Value())
		if err != nil {
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
		// get the value of each field
		v, ok := f.Value().First().ValueString()
		if ok {
			row = append(row, v)
		}
	}

	return row, nil
}

func floatToString(input_num float32) string {
	return strconv.FormatFloat(float64(input_num), 'f', -1, 32)
}

// func getPointFields(s *schema.Schema) []*schema.Field {
// 	return lo.FilterMap(s.Fields(), func(ff *schema.Field, _ int) (*schema.Field, bool) {
// 		var hasPoint bool
// 		ff.TypeProperty().Match(schema.TypePropertyMatch{
// 			GeometryObject: func(f *schema.FieldGeometryObject) {
// 				if f.SupportedTypes().Has(schema.GeometryObjectSupportedTypePoint) {
// 					hasPoint = true
// 				}
// 			},
// 			GeometryEditor: func(f *schema.FieldGeometryEditor) {
// 				if f.SupportedTypes().Has(schema.GeometryEditorSupportedTypePoint) {
// 					hasPoint = true
// 				}
// 			},
// 		})
// 		return ff, hasPoint
// 	})
// }
