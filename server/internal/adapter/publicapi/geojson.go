package publicapi

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sort"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func toGeoJSON(c echo.Context, l ListResult[Item], s *schema.Schema) error {
	if !hasGeometryFields(s) {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	pr, pw := io.Pipe()

	go handleGeoJSONGeneration(pw, l)

	return c.Stream(http.StatusOK, "application/json", pr)
}

func handleGeoJSONGeneration(pw *io.PipeWriter, l ListResult[Item]) {
	err := generateGeoJSON(pw, l)
	if err != nil {
		log.Errorf("failed to generate GeoJSON: %+v", err)
	}
	_ = pw.CloseWithError(err)
}

func generateGeoJSON(pw *io.PipeWriter, l ListResult[Item]) error {
	var features []Feature

	for _, itm := range l.Results {
		properties := map[string]interface{}{}
		geoFields := []*Geometry{}

		for k, v := range itm.Fields {
			g, ok := isGeometry(v)
			if ok {
				geoFields = append(geoFields, g)
				continue
			}
			properties[k] = v
		}

		if len(geoFields) == 0 {
			continue
		}
		sort.Slice(geoFields, func(i, j int) bool {
			return *geoFields[i].Type > *geoFields[j].Type
		})

		feature := Feature{
			Type:       lo.ToPtr(FeatureTypeFeature),
			Id:         &itm.ID,
			Geometry:   geoFields[0],
			Properties: &properties,
		}

		features = append(features, feature)
	}

	if len(features) == 0 {
		return errors.New("no valid geometry field in this model")
	}

	featureCollection := FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}

	return json.NewEncoder(pw).Encode(featureCollection)
}

func isGeometry(v any) (*Geometry, bool) {
	var geo string
	switch value := v.(type) {
	case []interface{}:
		if len(value) == 0 {
			return nil, false
		}
		if geoStr, ok := value[0].(string); ok {
			geo = geoStr
		} else {
			return nil, false
		}
	case string:
		geo = value
	default:
		return nil, false
	}

	g, err := stringToGeometry(geo)
	if err != nil || g == nil {
		return nil, false
	}
	return g, true
}

func hasGeometryFields(s *schema.Schema) bool {
	if s == nil {
		return false
	}
	return len(s.FieldsByType(value.TypeGeometryObject)) > 0 || len(s.FieldsByType(value.TypeGeometryEditor)) > 0
}

func stringToGeometry(geoString string) (*Geometry, error) {
	var geometry Geometry
	if err := json.Unmarshal([]byte(geoString), &geometry); err != nil {
		return nil, err
	}
	return &geometry, nil
}
