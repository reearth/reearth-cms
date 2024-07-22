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

var noGeometryFieldError = rerror.NewE(i18n.T("no geometry field in this model"))

func FeatureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*FeatureCollection, error) {
	if !hasGeometryFields(s) {
		return nil, noGeometryFieldError
	}

	geoField, err := getGeometryField(s)
	if err != nil {
		return nil, err
	}

	fl := lo.Map(ver, func(v item.Versioned, _ int) Feature {
		return FeatureFromItem(v, s, geoField)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &fl,
	}, nil
}

func FeatureFromItem(ver item.Versioned, s *schema.Schema, geo *schema.Field) Feature {
	itm := ver.Value()
	geoField := itm.Field(geo.ID())
	vv := *geoField.Value().First()
	ss, _ := vv.ValueString()
	geometry, _ := StringToGeometry(ss)

	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         itm.ID().Ref(),
		Geometry:   geometry,
		Properties: getProperties(itm, s),
	}
}

func hasGeometryFields(s *schema.Schema) bool {
	return s.FieldsByType(value.TypeGeometryEditor) != nil && s.FieldsByType(value.TypeGeometryObject) != nil
}

func getGeometryField(s *schema.Schema) (*schema.Field, error) {
	geoFields := append(s.FieldsByType(value.TypeGeometryObject), s.FieldsByType(value.TypeGeometryEditor)...)
	if len(geoFields) == 0 {
		return nil, noGeometryFieldError
	}

	return geoFields[0], nil
}

func getProperties(itm *item.Item, s *schema.Schema) *map[string]interface{} {
	p := make(map[string]interface{})
	otherFields := lo.Filter(s.Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})

	if len(otherFields) > 0 {
		for _, f := range otherFields {
			key := f.Name()
			val := itm.Field(f.ID()).Value()
			p[key] = val
		}
	}

	return &p
}

func StringToGeometry(geoString string) (*Geometry, error) {
	var geo Geometry
	if err := json.Unmarshal([]byte(geoString), &geo); err != nil {
		return nil, err
	}

	return &geo, nil
}
