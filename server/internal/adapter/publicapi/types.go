package publicapi

import (
	"bytes"
	"encoding/json"
	"io"
	"net/url"
	"path"
	"reflect"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
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

func NewItemListResult(w io.Writer, pi *usecasex.PageInfo, p *usecasex.Pagination) ListResult[any] {
	r := ListResult[any]{
		Results:    writerToItems(w),
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

// writerToItems extracts items from an io.Writer containing JSON data
func writerToItems(w io.Writer) []any {
	// Check if the writer is a bytes.Buffer or similar type that we can read from
	var buf *bytes.Buffer

	switch writer := w.(type) {
	case *bytes.Buffer:
		buf = writer
	default:
		// If it's not a readable buffer type, return empty slice
		return []any{}
	}

	// If buffer is empty, return empty slice
	if buf.Len() == 0 {
		return []any{}
	}

	// Parse the JSON data
	var data map[string]any
	decoder := json.NewDecoder(bytes.NewReader(buf.Bytes()))
	if err := decoder.Decode(&data); err != nil {
		return []any{}
	}

	// Extract the "results" array from the JSON structure
	items, ok := data["results"]
	if !ok {
		return []any{}
	}

	// Convert to []any if it's an array
	if itemsArray, ok := items.([]any); ok {
		return itemsArray
	}

	return []any{}
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

func NewItem(i *item.Item, sp *schema.Package, assets asset.List, refItems []Item) Item {
	gsf := schema.FieldList{}
	for _, groupSchema := range sp.GroupSchemas() {
		gsf = append(gsf, groupSchema.Fields().Clone()...)
	}
	itm := Item{
		ID:     i.ID().String(),
		Fields: NewItemFields(i.Fields(), sp.Schema().Fields(), gsf, refItems, assets),
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

func NewItemFields(fields item.Fields, sfields schema.FieldList, groupFields schema.FieldList, refItems []Item, assets asset.List) ItemFields {
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
					itemAssets = append(itemAssets, NewItemAsset(as))
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
				igf := NewItemFields(gf, groupFields, nil, nil, assets)
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
	})).DropEmptyFields()
}

type Asset struct {
	Type        string   `json:"type"`
	ID          string   `json:"id,omitempty"`
	URL         string   `json:"url,omitempty"`
	ContentType string   `json:"contentType,omitempty"`
	Files       []string `json:"files,omitempty"`
}

func NewAsset(a *asset.Asset, f *asset.File) Asset {
	// TODO: how to handle public api with asset url management
	ai := a.AccessInfo()

	var files []string
	if ai.Url != "" {
		base, _ := url.Parse(ai.Url)
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
		URL:         ai.Url,
		ContentType: f.ContentType(),
		Files:       files,
	}
}

type ItemAsset struct {
	Type string `json:"type"`
	ID   string `json:"id,omitempty"`
	URL  string `json:"url,omitempty"`
}

func NewItemAsset(a *asset.Asset) ItemAsset {
	ai := a.AccessInfo()
	return ItemAsset{
		Type: "asset",
		ID:   a.ID().String(),
		URL:  ai.Url,
	}
}
