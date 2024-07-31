package publicapi

import (
	"encoding/csv"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func extractFirstPointField(itm Item) ([]float64, bool) {
	for _, v := range itm.Fields {
		geo, ok := isGeometry(v)
		if ok && geo != nil {
			if *geo.Type != integrationapi.GeometryTypePoint {
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

func toCSV(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		w := csv.NewWriter(pw)
		keys := lo.FilterMap(s.Fields(), func(f *schema.Field, _ int) (string, bool) {
			return f.Key().String(), !integrationapi.IsGeometryField(f)
		})
		err = w.Write(append([]string{"id", "location_lat", "location_lng"}, keys...))
		if err != nil {
			log.Errorf("filed to write csv headers, err: %+v", err)
			return
		}

		for _, itm := range l.Results {
			values := []string{itm.ID}

			coordinates, ok := extractFirstPointField(itm)
			if !ok {
				continue
			}
			lat, lng := integrationapi.Float64ToString(coordinates[0]), integrationapi.Float64ToString(coordinates[1])
			values = append(values, lat, lng)

			for _, k := range keys {
				values = append(values, toCSVValue(itm.Fields[k]))
			}
			err = w.Write(values)
			if err != nil {
				log.Errorf("filed to write csv value, err: %+v", err)
				return
			}
		}
		w.Flush()
	}()

	return c.Stream(http.StatusOK, "text/csv", pr)
}

func toCSVValue(i interface{}) string {
	if i == nil {
		return ""
	}
	if v, ok := i.(string); ok {
		return v
	} else if v, ok := i.(float64); ok {
		return strconv.FormatFloat(v, 'f', -1, 64)
	} else if v, ok := i.(int64); ok {
		return strconv.FormatInt(v, 10)
	} else if v, ok := i.(bool); ok {
		return strconv.FormatBool(v)
	} else if v, ok := i.(time.Time); ok {
		return v.Format(time.RFC3339)
	} else {
		return ""
	}
}
