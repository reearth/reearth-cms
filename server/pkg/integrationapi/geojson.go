package integrationapi

import (
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var noGeometryFieldError = rerror.NewE(i18n.T("no geometry field in this model"))

func NewFeatureCollection(ver item.VersionedList, sp *schema.Package, idOrKey *schema.FieldIDOrKey) (*FeatureCollection, error) {
	if !hasGeometryFields(sp) {
		return nil, noGeometryFieldError
	}

	geoField, err := getGeometryField(sp, idOrKey)
	if err != nil {
		return nil, err
	}

	fl := lo.Map(ver, func(v item.Versioned, _ int) Feature {
		return NewFeature(v, sp, geoField)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &fl,
	}, nil
}

func hasGeometryFields(sp *schema.Package) bool {
	return sp.Schema().FieldsByType(value.TypeGeometryEditor) != nil && sp.Schema().FieldsByType(value.TypeGeometryObject) != nil
}

func getGeometryField(sp *schema.Package, idOrKey *schema.FieldIDOrKey) (*schema.Field, error) {
	if idOrKey != nil {
		return getFieldByIDOrKey(sp, idOrKey), nil
	}

	geoFields := append(sp.Schema().FieldsByType(value.TypeGeometryObject), sp.Schema().FieldsByType(value.TypeGeometryEditor)...)
	if len(geoFields) == 0 {
		return nil, noGeometryFieldError
	}

	return geoFields[0], nil
}

func getFieldByIDOrKey(sp *schema.Package, idOrKey *schema.FieldIDOrKey) *schema.Field {
	sIdOrKey := string(*idOrKey)
	idd, key := parseIDOrKey(sIdOrKey)
	return sp.Schema().FieldByIDOrKey(idd, key)
}

func parseIDOrKey(sIdOrKey string) (*id.FieldID, *id.Key) {
	if res, err := id.FieldIDFrom(sIdOrKey); err == nil {
		return &res, nil
	}
	return nil, id.NewKey(sIdOrKey).Ref()
}

func NewFeature(ver item.Versioned, sp *schema.Package, geo *schema.Field) Feature {
	itm := ver.Value()
	geoField := itm.Field(geo.ID())
	vv := *geoField.Value().First()
	ss, _ := vv.ValueString()
	geometry, _ := StringToGeometry(ss)

	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         itm.ID().Ref(),
		Geometry:   geometry,
		Properties: getProperties(itm, sp),
	}
}

func getProperties(itm *item.Item, sp *schema.Package) *map[string]interface{} {
	p := make(map[string]interface{})
	otherFields := lo.Filter(sp.Schema().Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})

	for _, f := range otherFields {
		key := f.Name()
		val := itm.Field(f.ID()).Value()
		p[key] = val
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
