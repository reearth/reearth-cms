package exporters

import (
	"encoding/json"
	"reflect"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/types"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/samber/lo"
)

type ItemMap map[string]any

func (i ItemMap) DropEmptyFields() ItemMap {
	for k, v := range i {
		if v == nil {
			delete(i, k)
		}
		rv := reflect.ValueOf(v)
		if (rv.Kind() == reflect.Interface && rv.IsNil()) ||
			((rv.Kind() == reflect.Slice || rv.Kind() == reflect.Array || rv.Kind() == reflect.Map) && (rv.IsNil() || rv.Len() == 0)) {
			delete(i, k)
		}
	}
	return i
}

func MapFromItem(itm *item.Item, sp *schema.Package, al AssetLoader, il ItemLoader) ItemMap {
	if itm == nil {
		return nil
	}

	var convertFields func(iid *id.ItemID, fields item.Fields, sfields schema.FieldList, groupFields schema.FieldList, al AssetLoader, il ItemLoader, deep int) ItemMap

	convertFields = func(iid *id.ItemID, fields item.Fields, sfields schema.FieldList, groupFields schema.FieldList, al AssetLoader, il ItemLoader, deep int) ItemMap {
		m := ItemMap(lo.SliceToMap(fields, func(f *item.Field) (k string, val any) {
			sf := sfields.Find(f.FieldID())
			if sf == nil {
				return k, nil
			}

			if sf != nil {
				k = sf.Key().String()
			}
			if k == "" {
				k = f.FieldID().String()
			}

			if sf.Type() == value.TypeAsset {
				aIds, ok := f.Value().ValuesAsset()
				if !ok || len(aIds) == 0 {
					return k, nil
				}
				if al == nil {
					if sf.Multiple() {
						val = aIds
					} else if len(aIds) > 0 {
						val = aIds[0]
					}
					return
				}
				assets, err := al(aIds)
				if err != nil {
					return k, nil
				}
				itemAssets := lo.Map(assets, func(a *asset.Asset, _ int) types.Asset {
					return types.Asset{
						Type: "asset",
						ID:   a.ID().String(),
						URL:  a.AccessInfo().Url,
					}
				})
				if sf.Multiple() {
					val = itemAssets
				} else if len(itemAssets) > 0 {
					val = itemAssets[0]
				}
			} else if sf.Type() == value.TypeReference {
				rfIds, ok := f.Value().ValuesReference()
				if !ok || len(rfIds) == 0 {
					return k, nil
				}
				if il == nil || deep >= 1 {
					if sf.Multiple() {
						val = rfIds
					} else if len(rfIds) > 0 {
						val = rfIds[0]
					}
					return
				}
				items, err := il(rfIds)
				if err != nil {
					return k, nil
				}
				refItems := lo.Map(items, func(it *item.Item, _ int) ItemMap {
					return convertFields(it.ID().Ref(), it.Fields(), sp.ReferencedSchemas().Fields(), nil, al, il, deep+1)
				})
				if sf.Multiple() {
					val = refItems
				} else if len(refItems) > 0 {
					val = refItems[0]
				}
			} else if sf.Type() == value.TypeGroup {
				var res []ItemMap
				for _, v := range f.Value().Values() {
					itgID, ok := v.ValueGroup()
					if !ok {
						continue
					}
					gf := fields.FieldsByGroup(itgID)
					igf := convertFields(nil, gf, groupFields, nil, al, nil, deep+1)
					res = append(res, igf)
				}
				if sf.Multiple() {
					val = res
				} else if len(res) == 1 {
					val = res[0]
				}
			} else if sf.Type() == value.TypeGeometryObject || sf.Type() == value.TypeGeometryEditor {
				// Parse geometry JSON strings into actual JSON objects
				if sf.Multiple() {
					var geoValues []any
					for _, v := range f.Value().Values() {
						if geoStr, ok := v.Value().(string); ok && geoStr != "" {
							var geoJSON any
							if err := json.Unmarshal([]byte(geoStr), &geoJSON); err == nil {
								geoValues = append(geoValues, geoJSON)
							} else {
								geoValues = append(geoValues, geoStr) // fallback to string if parsing fails
							}
						} else {
							geoValues = append(geoValues, nil) // explicitly handle non-string values
						}
					}
					val = geoValues
				} else {
					if first := f.Value().First(); first != nil {
						if geoStr, ok := first.Value().(string); ok && geoStr != "" {
							var geoJSON any
							if err := json.Unmarshal([]byte(geoStr), &geoJSON); err == nil {
								val = geoJSON
							} else {
								val = geoStr // fallback to string if parsing fails
							}
						} else {
							val = first.Value() // fallback to the original value if not a non-empty string
						}
					}
				}
			} else if sf.Multiple() {
				val = f.Value().Interface()
			} else {
				val = f.Value().First().Interface()
			}

			return
		}))
		m["id"] = iid.StringRef()
		return m.DropEmptyFields()
	}

	m := convertFields(itm.ID().Ref(), itm.Fields(), sp.Schema().Fields(), sp.GroupSchemas().Fields(), al, il, 0)

	return m.DropEmptyFields()
}
