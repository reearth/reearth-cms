package publicapi

import (
	"encoding/json"
	"net/url"
	"path"
	"reflect"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type ListResult[T any] struct {
	Results    []T   `json:"results"`
	TotalCount int64 `json:"totalCount"`
	HasMore    *bool `json:"hasMore,omitempty"`
	// offset base
	Limit  *int64 `json:"limit,omitempty"`
	Offset *int64 `json:"offset,omitempty"`
	Page   *int64 `json:"page,omitempty"`
	// cursor base
	NextCursor *string `json:"nextCursor,omitempty"`
}

func NewListResult[T any](results []T, pi *usecasex.PageInfo, p *usecasex.Pagination) ListResult[T] {
	if results == nil {
		results = []T{}
	}

	r := ListResult[T]{
		Results:    results,
		TotalCount: pi.TotalCount,
	}

	if p.Cursor != nil {
		r.NextCursor = pi.EndCursor.StringRef()
		r.HasMore = &pi.HasNextPage
	} else if p.Offset != nil {
		page := p.Offset.Offset/p.Offset.Limit + 1
		r.Limit = lo.ToPtr(p.Offset.Limit)
		r.Offset = lo.ToPtr(p.Offset.Offset)
		r.Page = lo.ToPtr(page)
		r.HasMore = lo.ToPtr((page+1)*p.Offset.Limit < pi.TotalCount)
	}

	return r
}

type ListParam struct {
	Pagination *usecasex.Pagination
}

type Item struct {
	ID     string
	Fields ItemFields
}

func (i Item) MarshalJSON() ([]byte, error) {
	m := i.Fields
	m["id"] = i.ID

	return json.Marshal(m)
}

func NewItem(i *item.Item, sp *schema.Package, assets asset.List, urlResolver asset.URLResolver, refItems []Item) Item {
	gsf := schema.FieldList{}
	for _, groupSchema := range sp.GroupSchemas() {
		gsf = append(gsf, groupSchema.Fields().Clone()...)
	}
	itm := Item{
		ID:     i.ID().String(),
		Fields: NewItemFields(i.Fields(), sp.Schema().Fields(), gsf, refItems, assets, urlResolver),
	}

	return itm
}

type ItemFields map[string]any

func (i ItemFields) DropEmptyFields() ItemFields {
	for k, v := range i {
		if v == nil {
			delete(i, k)
		}
		rv := reflect.ValueOf(v)
		if (rv.Kind() == reflect.Interface || rv.Kind() == reflect.Slice || rv.Kind() == reflect.Map) && rv.IsNil() {
			delete(i, k)
		}
	}
	return i
}

func NewItemFields(fields item.Fields, sfields schema.FieldList, groupFields schema.FieldList, refItems []Item, assets asset.List, urlResolver asset.URLResolver) ItemFields {
	return ItemFields(lo.SliceToMap(fields, func(f *item.Field) (k string, val any) {
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
			var itemAssets []ItemAsset
			for _, v := range f.Value().Values() {
				aid, ok := v.ValueAsset()
				if !ok {
					continue
				}
				if as, ok := lo.Find(assets, func(a *asset.Asset) bool { return a != nil && a.ID() == aid }); ok {
					itemAssets = append(itemAssets, NewItemAsset(as, urlResolver))
				}
			}

			if sf.Multiple() {
				val = itemAssets
			} else if len(itemAssets) > 0 {
				val = itemAssets[0]
			}
		} else if sf.Type() == value.TypeReference {
			rf, _ := f.Value().ValuesReference()
			if len(rf) > 0 {
				v, ok := lo.Find(refItems, func(item Item) bool {
					return item.ID == rf[0].String()
				})
				if ok {
					val = v
				}
			}
		} else if sf.Type() == value.TypeGroup {
			var res []ItemFields
			for _, v := range f.Value().Values() {
				itgID, ok := v.ValueGroup()
				if !ok {
					continue
				}
				gf := fields.FieldsByGroup(itgID)
				igf := NewItemFields(gf, groupFields, nil, nil, assets, urlResolver)
				res = append(res, igf)
			}
			if sf.Multiple() {
				val = res
			} else if len(res) == 1 {
				val = res[0]
			}
		} else if sf.Multiple() {
			val = f.Value().Interface()
		} else {
			val = f.Value().First().Interface()
		}

		return
	})).DropEmptyFields()
}

type Asset struct {
	Type        string   `json:"type"`
	ID          string   `json:"id,omitempty"`
	URL         string   `json:"url,omitempty"`
	ContentType string   `json:"contentType,omitempty"`
	Files       []string `json:"files,omitempty"`
}

func NewAsset(a *asset.Asset, f *asset.File, urlResolver asset.URLResolver) Asset {
	u := ""
	var files []string
	if urlResolver != nil {
		u = urlResolver(a)
		base, _ := url.Parse(u)
		base.Path = path.Dir(base.Path)

		files = lo.Map(f.FilePaths(), func(p string, _ int) string {
			b := *base
			b.Path = path.Join(b.Path, p)
			return b.String()
		})
	}

	return Asset{
		Type:        "asset",
		ID:          a.ID().String(),
		URL:         u,
		ContentType: f.ContentType(),
		Files:       files,
	}
}

type ItemAsset struct {
	Type string `json:"type"`
	ID   string `json:"id,omitempty"`
	URL  string `json:"url,omitempty"`
}

func NewItemAsset(a *asset.Asset, urlResolver asset.URLResolver) ItemAsset {
	u := ""
	if urlResolver != nil {
		u = urlResolver(a)
	}

	return ItemAsset{
		Type: "asset",
		ID:   a.ID().String(),
		URL:  u,
	}
}

type SchemaJSON struct {
	Schema      *string                 `json:"schema,omitempty"`
	Id          *string                 `json:"id,omitempty"`
	Title       *string                 `json:"title,omitempty"`
	Description *string                 `json:"description,omitempty"`
	Type        *string                 `json:"type,omitempty"`
	Properties  *map[string]interface{} `json:"properties,omitempty"`
}

func NewSchemaJSON(m *model.Model, pp *map[string]interface{}) SchemaJSON {
	return SchemaJSON{
		Schema:      lo.ToPtr("https://json-schema.org/draft/2020-12/schema"),
		Id:          m.ID().Ref().StringRef(),
		Title:       lo.ToPtr(m.Name()),
		Description: lo.ToPtr(m.Description()),
		Type:        lo.ToPtr("object"),
		Properties:  pp,
	}
}

// GeoJSON
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
	Geometry   *Geometry               `json:"geometry,omitempty"`
	Id         *string                 `json:"id,omitempty"`
	Properties *map[string]interface{} `json:"properties,omitempty"`
	Type       *FeatureType            `json:"type,omitempty"`
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
