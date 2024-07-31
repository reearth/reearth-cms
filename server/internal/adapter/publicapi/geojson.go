package publicapi

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/log"
)

func isGeometry(v any) (*integrationapi.Geometry, bool) {
	geo, ok := v.(string)
	if !ok {
		return nil, false
	}
	g, err := stringToGeometry(geo)
	if err != nil || g == nil {
		return nil, false
	}
	return g, true
}

func toGeoJSON(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	if !hasGeometryFields(s) {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	pr, pw := io.Pipe()

	go func() {
		var err error
		defer func() {
			_ = pw.CloseWithError(err)
		}()

		features := []map[string]interface{}{}

		for _, itm := range l.Results {
			properties := map[string]interface{}{}
			geoFields := []*integrationapi.Geometry{}
			for k, v := range itm.Fields {
				f, ok := isGeometry(v)
				if ok {
					geoFields = append(geoFields, f)
					continue
				}
				properties[k] = v
			}
			if len(geoFields) == 0 {
				continue
			}
			geometry := geoFields[0]

			feature := map[string]interface{}{
				"type":       "Feature",
				"id":         itm.ID,
				"properties": properties,
				"geometry":   geometry,
			}

			features = append(features, feature)
		}

		if len(features) == 0 {
			return
		}

		featureCollection := map[string]interface{}{
			"type":     "FeatureCollection",
			"features": features,
		}

		err = json.NewEncoder(pw).Encode(featureCollection)
		if err != nil {
			log.Printf("failed to encode GeoJSON, err: %+v", err)
			return
		}
	}()

	return c.Stream(http.StatusOK, "application/json", pr)
}

func hasGeometryFields(s *schema.Schema) bool {
	if s == nil {
		return false
	}
	hasObject := len(s.FieldsByType(value.TypeGeometryObject)) > 0
	hasEditor := len(s.FieldsByType(value.TypeGeometryEditor)) > 0
	return hasObject || hasEditor
}

func stringToGeometry(geoString string) (*integrationapi.Geometry, error) {
	var geometry integrationapi.Geometry
	if err := json.Unmarshal([]byte(geoString), &geometry); err != nil {
		return nil, err
	}
	return &geometry, nil
}
