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
	// if model has no geometry field, return and error.
	if sp.Schema().FieldsByType(value.TypeGeometryEditor) == nil || sp.Schema().FieldsByType(value.TypeGeometryObject) == nil {
		return nil, noGeometryFieldError
	}

	// if there are multiple geometry fields
	//   - Idea1: use the first geometry field and ignore other geometry fields ← OK for now!
	//   - idea2: specify geometry field key or ID in URL
	var geoField *schema.Field
	if idOrKey != nil {
		sIdOrKey := string(*idOrKey)
		var idd id.FieldID
		var key id.Key
		res, err := id.FieldIDFrom(sIdOrKey)
		if err == nil {
			idd = res
		} else {
			key = id.NewKey(sIdOrKey)
		}
		geoField = sp.Schema().FieldByIDOrKey(&idd, &key)
	} else {
		geoObjectFields := sp.Schema().FieldsByType(value.TypeGeometryObject)
		geoEditorFields := sp.Schema().FieldsByType(value.TypeGeometryEditor)
		var geoFields []*schema.Field
		if len(geoObjectFields) > 0 {
			geoFields = append(geoFields, geoObjectFields...)
		}
		if len(geoEditorFields) > 0 {
			geoFields = append(geoFields, geoEditorFields...)
		}
		geoField = geoFields[0]
	}

	fl := lo.Map(ver, func(v item.Versioned, _ int) Feature {
		return NewFeature(v, sp, geoField)
	})
	return &FeatureCollection{
		Type:     lo.ToPtr(FeatureCollectionTypeFeatureCollection),
		Features: &fl,
	}, nil
}

func NewFeature(ver item.Versioned, sp *schema.Package, geo *schema.Field) Feature {
	itm := ver.Value()
	var g Geometry
	var p map[string]interface{}

	// for geometry
	// if the geometry field is multiple, use the first one.
	geoField := itm.Field(geo.ID())
	vv := *geoField.Value().First()
	ss, _ := vv.ValueString()
	geometry, _ := StringToGeometry(ss)
	g = *geometry

	// for properties:
	// get the key from the model schema
	// and get the value from the item schema
	otherFields := lo.Filter(sp.Schema().Fields(), func(f *schema.Field, _ int) bool {
		return f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor
	})
	if len(otherFields) > 0 {
		for _, f := range sp.Schema().Fields() {
			if f.Type() != value.TypeGeometryObject && f.Type() != value.TypeGeometryEditor {
				key := f.Name()
				value := itm.Field(f.ID()).Value()
				p[key] = value
			}
		}
	}

	return Feature{
		Type:       lo.ToPtr(FeatureTypeFeature),
		Id:         itm.ID().Ref(),
		Geometry:   &g,
		Properties: &p,
	}
}

// Function to convert a stringified Geometry to a Geometry type
func StringToGeometry(geoString string) (*Geometry, error) {
	var geo Geometry
	if err := json.Unmarshal([]byte(geoString), &geo); err != nil {
		return nil, err
	}

	return &geo, nil
}
