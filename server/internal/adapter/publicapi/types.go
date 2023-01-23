package publicapi

import (
	"encoding/json"
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
	Results    []T `json:"results"`
	TotalCount int `json:"totalCount"`
	// cursor base
	NextCursor *string `json:"nextCursor,omitempty"`
	HasMore    *bool   `json:"hasMore,omitempty"`
}

func NewListResult[T any](results []T, pi *usecasex.PageInfo, cursor bool) ListResult[T] {
	if results == nil {
		results = []T{}
	}

	var nextCursor *string
	var hasMore *bool
	if pi != nil && cursor {
		nextCursor = pi.EndCursor.StringRef()
		hasMore = &pi.HasNextPage
	}

	return ListResult[T]{
		Results:    results,
		TotalCount: int(pi.TotalCount),
		NextCursor: nextCursor,
		HasMore:    hasMore,
	}
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

func NewItem(i *item.Item, s *schema.Schema, assets asset.List, urlResolver asset.URLResolver) Item {
	return Item{
		ID:     i.ID().String(),
		Fields: NewItemFields(i.Fields(), s.Fields(), assets, urlResolver),
	}
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

func NewItemFields(fields []*item.Field, sfields schema.FieldList, assets asset.List, urlResolver asset.URLResolver) ItemFields {
	return ItemFields(lo.SliceToMap(fields, func(f *item.Field) (k string, val any) {
		sf := sfields.Find(f.FieldID())
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

func NewAsset(a *asset.Asset, urlResolver asset.URLResolver) Asset {
	f := a.File()
	if f == nil {
		return Asset{}
	}

	u := ""
	var files []string
	if urlResolver != nil {
		u = urlResolver(a)
		base, _ := url.Parse(u)
		base.Path = path.Dir(base.Path)

		files = lo.Map(a.File().Files(), func(f *asset.File, _ int) string {
			b := *base
			b.Path = path.Join(b.Path, f.Path())
			return b.String()
		})
	}

	return Asset{
		Type:        "asset",
		ID:          a.ID().String(),
		URL:         u,
		ContentType: a.File().ContentType(),
		Files:       files,
	}
}

type ItemAsset struct {
	Type        string `json:"type"`
	ID          string `json:"id,omitempty"`
	URL         string `json:"url,omitempty"`
	ContentType string `json:"contentType,omitempty"`
}

func NewItemAsset(a *asset.Asset, urlResolver asset.URLResolver) ItemAsset {
	f := a.File()
	if f == nil {
		return ItemAsset{}
	}

	u := ""
	if urlResolver != nil {
		u = urlResolver(a)
	}

	return ItemAsset{
		Type:        "asset",
		ID:          a.ID().String(),
		URL:         u,
		ContentType: a.File().ContentType(),
	}
}
