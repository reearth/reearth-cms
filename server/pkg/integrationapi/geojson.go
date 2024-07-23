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

	fl := lo.FilterMap(ver, func(v item.Versioned, _ int) (Feature, bool) {
		return FeatureFromItem(v, s)
	})

	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &fl,
	}, nil
}

func FeatureFromItem(ver item.Versioned, s *schema.Schema) (Feature, bool) {
	if s == nil {
		return Feature{}, false
	}
	itm := ver.Value()
	geoField, ok := getGeometryField(itm)
	if !ok {
		return Feature{}, false
	}
	vv := *geoField.Value().First()
	ss, _ := vv.ValueString()
	geometry, _ := StringToGeometry(ss)

	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         itm.ID().Ref(),
		Geometry:   geometry,
		Properties: getProperties(itm, s),
	}, true
}

func hasGeometryFields(s *schema.Schema) bool {
	if s == nil {
		return false
	}
	hasObject := len(s.FieldsByType(value.TypeGeometryObject)) != 0
	hasEditor := len(s.FieldsByType(value.TypeGeometryEditor)) != 0
	return hasObject || hasEditor
}

func getGeometryField(i *item.Item) (*item.Field, bool) {
	if i == nil {
		return nil, false
	}
	geoObjectFields := i.Fields().FieldsByType(value.TypeGeometryObject)
	geoEditorFields := i.Fields().FieldsByType(value.TypeGeometryEditor)
	geoFields := append(geoObjectFields, geoEditorFields...)
	if len(geoFields) == 0 {
		return nil, false
	}

	return geoFields[0], true
}

func getProperties(itm *item.Item, s *schema.Schema) *map[string]interface{} {
	if itm == nil || s == nil {
		return nil
	}
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
