package publicapi

import (
	"encoding/csv"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func toCSV(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	if !isPointFieldSupported(s) {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "point type is not supported in this model",
		})
	}

	pr, pw := io.Pipe()
	go handleCSVGeneration(pw, l, s)

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "text/csv")
	return c.Stream(http.StatusOK, "text/csv", pr)
}

func handleCSVGeneration(pw *io.PipeWriter, l ListResult[Item], s *schema.Schema) {
	err := generateCSV(pw, l, s)
	if err != nil {
		log.Errorf("failed to generate CSV: %+v", err)
	}
	_ = pw.CloseWithError(err)
}

func generateCSV(pw *io.PipeWriter, l ListResult[Item], s *schema.Schema) error {
	w := csv.NewWriter(pw)
	defer w.Flush()

	keys := lo.FilterMap(s.Fields(), func(f *schema.Field, _ int) (string, bool) {
		return f.Key().String(), !isGeometryField(f)
	})
	err := w.Write(append([]string{"id", "location_lat", "location_lng"}, keys...))
	if err != nil {
		return err
	}

	for _, itm := range l.Results {
		values := []string{itm.ID}

		coordinates, ok := extractFirstPointField(itm)
		if !ok {
			continue
		}
		lat, lng := float64ToString(coordinates[0]), float64ToString(coordinates[1])
		values = append(values, lat, lng)

		for _, k := range keys {
			values = append(values, toCSVValue(itm.Fields[k]))
		}
		err = w.Write(values)
		if err != nil {
			return err
		}
	}

	return nil
}

func extractFirstPointField(itm Item) ([]float64, bool) {
	for _, v := range itm.Fields {
		geo, ok := isGeometry(v)
		if ok && geo != nil {
			if *geo.Type != GeometryTypePoint {
				continue
			}
			coordinates, err := geo.Coordinates.AsPoint()
			if err != nil {
				continue
			}
			if len(coordinates) >= 2 {
				return coordinates, true
			}
		}
	}
	return nil, false
}

func toCSVValue(i interface{}) string {
	if i == nil {
		return ""
	}
	switch v := i.(type) {
	case string:
		return v
	case float64:
		return float64ToString(v)
	case int64:
		return strconv.FormatInt(v, 10)
	case bool:
		return strconv.FormatBool(v)
	case time.Time:
		return v.Format(time.RFC3339)
	case []interface{}:
		if len(v) > 0 {
			return toCSVValue(v[0])
		}
		return ""
	default:
		return ""
	}
}

func isGeometryField(f *schema.Field) bool {
	return f.Type() == value.TypeGeometryObject || f.Type() == value.TypeGeometryEditor
}

func float64ToString(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
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