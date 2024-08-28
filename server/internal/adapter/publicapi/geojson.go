package publicapi

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

func toGeoJSON(c echo.Context, l item.VersionedList, s *schema.Schema) error {
	if !s.HasGeometryFields() {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "no geometry field in this model",
		})
	}

	fc, err := exporters.FeatureCollectionFromItems(l, s)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate GeoJSON").SetInternal(err)
	}

	c.Response().Header().Set(echo.HeaderContentDisposition, "attachment;")
	c.Response().Header().Set(echo.HeaderContentType, "application/json")
	return c.JSON(http.StatusOK, toFeatureCollection(fc))
}

func toFeatureCollection(fc *exporters.FeatureCollection) *FeatureCollection {
	if fc == nil || fc.Features == nil {
		return nil
	}

	features := lo.Map(*fc.Features, func(f exporters.Feature, _ int) Feature {
		return toFeature(f)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}
}

func toFeature(f exporters.Feature) Feature {
	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         f.Id,
		Geometry:   toGeometry(f.Geometry),
		Properties: f.Properties,
	}
}

func toGeometry(g *exporters.Geometry) *Geometry {
	if g == nil {
		return nil
	}

	return &Geometry{
		Type:        toGeometryType(g.Type),
		Coordinates: toCoordinates(g.Coordinates),
	}
}

func toGeometryType(t *exporters.GeometryType) *GeometryType {
	if t == nil {
		return nil
	}
	switch *t {
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

func toCoordinates(c *exporters.Geometry_Coordinates) *Geometry_Coordinates {
	if c == nil {
		return nil
	}
	union, err := c.MarshalJSON()
	if err != nil {
		return nil
	}
	return &Geometry_Coordinates{
		union: union,
	}
}
