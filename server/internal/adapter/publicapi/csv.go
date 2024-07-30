package publicapi

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

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
				var v []byte
				v, err = json.Marshal(itm.Fields[k])
				if err != nil {
					log.Errorf("filed to json marshal field value, err: %+v", err)
					return
				}
				if k != "GeometryEditor" && k != "GeometryObject" {
					values = append(values, fmt.Sprintf("%v", string(v)))
				}
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