package publicapi

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/log"
	"github.com/samber/lo"
)

func toGeoJSON(c echo.Context, l item.VersionedList, s *schema.Schema) error {
	if !s.HasGeometryFields() {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	pr, pw := io.Pipe()
	go handleGeoJSONGeneration(pw, l, s)

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "application/json")
	return c.Stream(http.StatusOK, "application/json", pr)
}

func handleGeoJSONGeneration(pw *io.PipeWriter, l item.VersionedList, s *schema.Schema) {
	err := generateGeoJSON(pw, l, s)
	if err != nil {
		log.Errorf("failed to generate GeoJSON: %+v", err)
	}
	_ = pw.CloseWithError(err)
}

func generateGeoJSON(pw *io.PipeWriter, l item.VersionedList, s *schema.Schema) error {
	features, err := exporters.FeatureCollectionFromItems(l, s)

	if err != nil {
		return err
	}

	featureCollection := ToFeatureCollection(features)
	return json.NewEncoder(pw).Encode(featureCollection)
}

func ToFeatureCollection(fc *exporters.FeatureCollection) *FeatureCollection {
	if fc == nil || fc.Features == nil {
		return nil
	}

	features := lo.Map(*fc.Features, func(f exporters.Feature, _ int) Feature {
		return *ToFeature(&f)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}
}

func ToFeature(f *exporters.Feature) *Feature {
	if f == nil {
		return nil
	}

	return &Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         f.Id,
		Geometry:   ToGeometry(f.Geometry),
		Properties: f.Properties,
	}
}

func ToGeometry(g *exporters.Geometry) *Geometry {
	if g == nil {
		return nil
	}

	return &Geometry{
		Type:        toGeometryType(*g.Type),
		Coordinates: toCoordinates(*g.Coordinates),
	}
}

func toGeometryType(t exporters.GeometryType) *GeometryType {
	switch t {
	case exporters.GeometryTypePoint:
		return lo.ToPtr(GeometryTypePoint)
	case exporters.GeometryTypeMultiPoint:
		return lo.ToPtr(GeometryTypeMultiPoint)
	case exporters.GeometryTypeLineString:
		return lo.ToPtr(GeometryTypeLineString)
	case exporters.GeometryTypeMultiLineString:
		return lo.ToPtr(GeometryTypeMultiLineString)
	case exporters.GeometryTypePolygon:
		return lo.ToPtr(GeometryTypePolygon)
	case exporters.GeometryTypeMultiPolygon:
		return lo.ToPtr(GeometryTypeMultiPolygon)
	case exporters.GeometryTypeGeometryCollection:
		return lo.ToPtr(GeometryTypeGeometryCollection)
	default:
		return nil
	}
}

func toCoordinates(c exporters.Geometry_Coordinates) *Geometry_Coordinates {
	union, err := c.MarshalJSON()
	if err != nil {
		return nil
	}
	return &Geometry_Coordinates{
		union: union,
	}
}
