package integrationapi

import (
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	noGeometryFieldError = rerror.NewE(i18n.T("no geometry field in this model"))
)

func FeatureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*FeatureCollection, error) {
	if !s.HasGeometryFields() {
		return nil, noGeometryFieldError
	}

	features := lo.FilterMap(ver, func(v item.Versioned, _ int) (Feature, bool) {
		return FeatureFromItem(v, s)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}, nil
}

func FeatureFromItem(ver item.Versioned, s *schema.Schema) (Feature, bool) {
	if s == nil {
		return Feature{}, false
	}
	itm := ver.Value()
	geoField, ok := itm.GetFirstGeometryField()
	if !ok {
		return Feature{}, false
	}
	geometry, ok := extractGeometry(geoField)
	if !ok {
		return Feature{}, false
	}

	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         itm.ID().Ref(),
		Geometry:   geometry,
		Properties: extractProperties(itm, s),
	}, true
}

func extractGeometry(field *item.Field) (*Geometry, bool) {
	geoStr, ok := field.Value().First().ValueString()
	if !ok {
		return nil, false
	}
	geometry, err := StringToGeometry(geoStr)
	if err != nil {
		return nil, false
	}
	return geometry, true
}

func extractProperties(itm *item.Item, s *schema.Schema) *map[string]interface{} {
	if itm == nil || s == nil {
		return nil
	}
	properties := make(map[string]interface{})
	nonGeoFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})
	for _, field := range nonGeoFields {
		key := field.Name()
		itmField := itm.Field(field.ID())
		val, ok := itmField.ToGeoJSONProp()
		if ok {
			properties[key] = val
		}
	}
	return &properties
}

func StringToGeometry(geoString string) (*Geometry, error) {
	var geometry Geometry
	if err := json.Unmarshal([]byte(geoString), &geometry); err != nil {
		return nil, err
	}
	return &geometry, nil
}
