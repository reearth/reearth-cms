package exporters

import (
	"time"

	"github.com/iancoleman/orderedmap"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	noGeometryFieldError = rerror.NewE(i18n.T("no geometry field in this model"))
)

func FeatureCollectionFromItems(l item.List, sp *schema.Package, assets asset.List) (*types.GeoJSON, error) {
	if !sp.Schema().HasGeometryFields() {
		return nil, noGeometryFieldError
	}

	features := lo.FilterMap(l, func(i *item.Item, _ int) (types.Feature, bool) {
		return featureFromItem(i, sp, assets)
	})

	if len(features) == 0 {
		return nil, noGeometryFieldError
	}

	return &types.GeoJSON{
		Type:     lo.ToPtr(types.FeatureCollectionTypeFeatureCollection),
		Features: &features,
	}, nil
}

func featureFromItem(itm *item.Item, sp *schema.Package, assets asset.List) (types.Feature, bool) {
	if sp == nil || sp.Schema() == nil {
		return types.Feature{}, false
	}
	geoField, ok := itm.GetFirstGeometryField()
	if !ok {
		return types.Feature{}, false
	}
	geometry, ok := extractGeometry(geoField)
	if !ok {
		return types.Feature{}, false
	}

	return types.Feature{
		Type:       lo.ToPtr(types.FeatureTypeFeature),
		Id:         itm.ID().Ref().StringRef(),
		Geometry:   geometry,
		Properties: extractProperties(itm, sp, assets),
	}, true
}

func extractProperties(itm *item.Item, sp *schema.Package, assets asset.List) *orderedmap.OrderedMap {
	if itm == nil || sp == nil || sp.Schema() == nil {
		return nil
	}
	properties := orderedmap.New()
	for _, field := range sp.Schema().Fields().Ordered() {
		switch field.Type() {
		case value.TypeGeometryObject, value.TypeGeometryEditor:
			continue
		case value.TypeGroup:
			gp, ok := extractGroupProperties(itm, sp, field)
			if ok {
				properties.Set(field.Key().String(), gp)
			}
			continue
		case value.TypeAsset:
			gp, ok := extractAssetProperties(itm, field, assets)
			if ok {
				properties.Set(field.Key().String(), gp)
			}
			continue
		default:
			itmField := itm.Field(field.ID())
			if val, ok := toGeoJSONProp(itmField); ok {
				properties.Set(field.Key().String(), val)
			}
		}
	}
	return properties
}

func extractAssetProperties(itm *item.Item, gf *schema.Field, assets asset.List) (any, bool) {
	type asset struct {
		ID   string `json:"id"`
		URL  string `json:"url"`
		Type string `json:"type"`
	}
	af := itm.Field(gf.ID())
	if af == nil || af.Value() == nil {
		return nil, false
	}
	vv, ok := af.Value().ValuesAsset()
	if !ok || len(vv) == 0 {
		return nil, false
	}
	if gf.Multiple() {
		return lo.Map(vv, func(v value.Asset, _ int) asset {
			a := assets.FindByID(v)
			if a != nil {
				return asset{
					ID:   v.String(),
					URL:  a.AccessInfo().Url,
					Type: v.Type(),
				}
			}
			return asset{
				ID:   v.String(),
				URL:  "",
				Type: v.Type(),
			}
		}), true
	} else {
		a := assets.FindByID(vv[0])
		if a != nil {
			return asset{
				ID:   vv[0].String(),
				URL:  a.AccessInfo().Url,
				Type: vv[0].Type(),
			}, true
		}
		return asset{
			ID:   vv[0].String(),
			URL:  "",
			Type: vv[0].Type(),
		}, true
	}
}

func extractGroupProperties(itm *item.Item, sp *schema.Package, gf *schema.Field) (any, bool) {
	var gId schema.GroupID
	gf.TypeProperty().Match(schema.TypePropertyMatch{
		Group: func(fg *schema.FieldGroup) {
			gId = fg.Group()
		},
	})

	s := sp.GroupSchema(gId)
	igf := itm.Field(gf.ID())
	if igf == nil || igf.Value() == nil {
		return nil, false
	}
	vv, ok := igf.Value().ValuesGroup()
	if !ok || len(vv) == 0 {
		return nil, false
	}
	if gf.Multiple() {
		return lo.Map(vv, func(v value.Group, _ int) *orderedmap.OrderedMap {
			return extractSingleGroupProperties(v, itm, s.Fields())
		}), true
	} else {
		return extractSingleGroupProperties(vv[0], itm, s.Fields()), true
	}
}

func extractSingleGroupProperties(gId value.Group, itm *item.Item, gf schema.FieldList) *orderedmap.OrderedMap {
	gp := orderedmap.New()
	for _, sf := range gf.Ordered() {
		f := itm.FieldByItemGroupAndID(sf.ID(), gId)
		if f == nil {
			continue
		}
		if val, ok := toGeoJSONProp(f); ok {
			gp.Set(sf.Key().String(), val)
		}
	}
	return gp
}

func extractGeometry(field *item.Field) (*types.Geometry, bool) {
	geoStr, ok := field.Value().First().ValueString()
	if !ok {
		return nil, false
	}
	geometry, err := stringToGeometry(geoStr)
	if err != nil {
		return nil, false
	}
	return geometry, true
}

func stringToGeometry(geoString string) (*types.Geometry, error) {
	var geometry types.Geometry
	if err := json.Unmarshal([]byte(geoString), &geometry); err != nil {
		return nil, err
	}
	return &geometry, nil
}

func toGeoJSONProp(f *item.Field) (any, bool) {
	if f == nil {
		return nil, false
	}
	if f.Value().Len() == 1 {
		return toGeoJsonSingleValue(f.Value().First())
	}
	m := value.MultipleFrom(f.Type(), f.Value().Values())
	return toGeoJSONMultipleValues(m)
}

func toGeoJSONMultipleValues(m *value.Multiple) ([]any, bool) {
	if m.Len() == 0 {
		return nil, false
	}
	return lo.FilterMap(m.Values(), func(v *value.Value, _ int) (any, bool) {
		return toGeoJsonSingleValue(v)
	}), true
}

func toGeoJsonSingleValue(vv *value.Value) (any, bool) {
	if vv == nil {
		return "", false
	}

	switch vv.Type() {
	case value.TypeText, value.TypeTextArea, value.TypeRichText, value.TypeMarkdown, value.TypeSelect, value.TypeTag:
		v, ok := vv.ValueString()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeURL:
		v, ok := vv.ValueURL()
		if !ok {
			return "", false
		}
		return v.String(), true
	case value.TypeInteger:
		v, ok := vv.ValueInteger()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeNumber:
		v, ok := vv.ValueNumber()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeBool, value.TypeCheckbox:
		v, ok := vv.ValueBool()
		if !ok {
			return "", false
		}
		return v, true
	case value.TypeDateTime:
		v, ok := vv.ValueDateTime()
		if !ok {
			return "", false
		}
		return v.Format(time.RFC3339), true
	case value.TypeAsset:
		v, ok := vv.ValueAsset()
		if !ok {
			return "", false
		}
		return v, true
	default:
		return "", false
	}
}
