package integrationapi

import (
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/samber/lo"
)

func FeatureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*FeatureCollection, error) {
	fc, err := exporters.FeatureCollectionFromItems(ver, s)
	if err != nil {
		return nil, err
	}
	return NewFeatureCollection(fc), nil
}

func NewFeatureCollection(fc *exporters.FeatureCollection) *FeatureCollection {
	if fc == nil || fc.Features == nil {
		return nil
	}

	features := lo.Map(*fc.Features, func(f exporters.Feature, _ int) Feature {
		return *NewFeature(&f)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}
}

func NewFeature(f *exporters.Feature) *Feature {
	if f == nil {
		return nil
	}

	return &Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         id.ItemIDFromRef(f.Id),
		Geometry:   NewGeometry(f.Geometry),
		Properties: f.Properties,
	}
}

func NewGeometry(g *exporters.Geometry) *Geometry {
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
