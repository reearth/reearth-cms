package exporters

import (
	"encoding/json"
	"time"

	"github.com/iancoleman/orderedmap"
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

type GeoJSON = FeatureCollection

type FeatureCollectionType string

const FeatureCollectionTypeFeatureCollection FeatureCollectionType = "FeatureCollection"

type FeatureCollection struct {
	Features *[]Feature             `json:"features,omitempty"`
	Type     *FeatureCollectionType `json:"type,omitempty"`
}

type FeatureType string

const FeatureTypeFeature FeatureType = "Feature"

type Feature struct {
	Geometry   *Geometry              `json:"geometry,omitempty"`
	Id         *string                `json:"id,omitempty"`
	Properties *orderedmap.OrderedMap `json:"properties,omitempty"`
	Type       *FeatureType           `json:"type,omitempty"`
}

type GeometryCollectionType string

const GeometryCollectionTypeGeometryCollection GeometryCollectionType = "GeometryCollection"

type GeometryCollection struct {
	Geometries *[]Geometry             `json:"geometries,omitempty"`
	Type       *GeometryCollectionType `json:"type,omitempty"`
}

type GeometryType string

const (
	GeometryTypeGeometryCollection GeometryType = "GeometryCollection"
	GeometryTypeLineString         GeometryType = "LineString"
	GeometryTypeMultiLineString    GeometryType = "MultiLineString"
	GeometryTypeMultiPoint         GeometryType = "MultiPoint"
	GeometryTypeMultiPolygon       GeometryType = "MultiPolygon"
	GeometryTypePoint              GeometryType = "Point"
	GeometryTypePolygon            GeometryType = "Polygon"
)

type Geometry struct {
	Coordinates *Geometry_Coordinates `json:"coordinates,omitempty"`
	Geometries  *[]Geometry           `json:"geometries,omitempty"`
	Type        *GeometryType         `json:"type,omitempty"`
}
type Geometry_Coordinates struct {
	union json.RawMessage
}

type LineString = []Point
type MultiLineString = []LineString
type MultiPoint = []Point
type MultiPolygon = []Polygon
type Point = []float64
type Polygon = [][]Point

func (t Geometry_Coordinates) AsPoint() (Point, error) {
	var body Point
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) AsMultiPoint() (MultiPoint, error) {
	var body MultiPoint
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) AsLineString() (LineString, error) {
	var body LineString
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) AsMultiLineString() (MultiLineString, error) {
	var body MultiLineString
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) AsPolygon() (Polygon, error) {
	var body Polygon
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) AsMultiPolygon() (MultiPolygon, error) {
	var body MultiPolygon
	err := json.Unmarshal(t.union, &body)
	return body, err
}

func (t Geometry_Coordinates) MarshalJSON() ([]byte, error) {
	b, err := t.union.MarshalJSON()
	return b, err
}

func (t *Geometry_Coordinates) UnmarshalJSON(b []byte) error {
	err := t.union.UnmarshalJSON(b)
	return err
}

func FeatureCollectionFromItems(ver item.VersionedList, s *schema.Schema) (*FeatureCollection, error) {
	if !s.HasGeometryFields() {
		return nil, noGeometryFieldError
	}

	features := lo.FilterMap(ver, func(v item.Versioned, _ int) (Feature, bool) {
		return FeatureFromItem(v, s)
	})

	if len(features) == 0 {
		return nil, noGeometryFieldError
	}

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
		Id:         itm.ID().Ref().StringRef(),
		Geometry:   geometry,
		Properties: extractProperties(itm, s),
	}, true
}

func extractProperties(itm *item.Item, s *schema.Schema) *orderedmap.OrderedMap {
	if itm == nil || s == nil {
		return nil
	}
	properties := orderedmap.New()
	for _, field := range s.Fields().Ordered() {
		if field.Type() == value.TypeGeometryObject || field.Type() == value.TypeGeometryEditor {
			continue
		}

		key := field.Name()
		itmField := itm.Field(field.ID())
		if val, ok := toGeoJSONProp(itmField); ok {
			properties.Set(key, val)
		}
	}
	return properties
}

func extractGeometry(field *item.Field) (*Geometry, bool) {
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

func stringToGeometry(geoString string) (*Geometry, error) {
	var geometry Geometry
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
	default:
		return "", false
	}
}
