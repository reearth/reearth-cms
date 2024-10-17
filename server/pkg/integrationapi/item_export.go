package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

// GeoJSON
func FeatureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*FeatureCollection, error) {
	fc, err := exporters.FeatureCollectionFromItems(ver, s)
	if err != nil {
		return nil, err
	}
	return newFeatureCollection(fc), nil
}

func newFeatureCollection(fc *exporters.FeatureCollection) *FeatureCollection {
	if fc == nil || fc.Features == nil {
		return nil
	}

	features := lo.Map(*fc.Features, func(f exporters.Feature, _ int) Feature {
		return newFeature(f)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}
}

func newFeature(f exporters.Feature) Feature {
	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         id.ItemIDFromRef(f.Id),
		Geometry:   newGeometry(f.Geometry),
		Properties: f.Properties,
	}
}

func newGeometry(g *exporters.Geometry) *Geometry {
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

// CSV
func BuildCSVHeaders(s *schema.Schema) []string {
	return exporters.BuildCSVHeaders(s)
}

func RowFromItem(itm *item.Item, nonGeoFields []*schema.Field) ([]string, bool) {
	return exporters.RowFromItem(itm, nonGeoFields)
}
