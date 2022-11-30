package publicapi

import (
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

type ListResult[T any] struct {
	Results    []T `json:"results"`
	TotalCount int `json:"totalCount"`
	Limit      int `json:"limit"`
	Offset     int `json:"offset"`
}

func NewListResult[T any](results []T, pi *usecasex.PageInfo, limit, offset int) ListResult[T] {
	return ListResult[T]{
		Results:    results,
		TotalCount: int(pi.TotalCount),
		Limit:      limit,
		Offset:     offset,
	}
}

type ListParam struct {
	Offset int
	Limit  int
	Order  string
	Sort   []string
}

func (p ListParam) Pagination() *usecasex.Pagination {
	return usecasex.OffsetPagination{
		Offset: int64(p.Offset),
		Limit:  int64(p.Limit),
	}.Wrap()
}

type Item struct {
	ID     string
	Fields ItemFields
}

func (i Item) MarshalJSON() ([]byte, error) {
	m := i.Fields
	m["id"] = ItemField{Value: i.ID}
	return json.Marshal(m)
}

func NewItem(i *item.Item, s *schema.Schema, assets asset.List, urlResolver asset.URLResolver) Item {
	return Item{
		ID:     i.ID().String(),
		Fields: NewItemFields(i.Fields(), s.Fields(), assets, urlResolver),
	}
}

type ItemFields map[string]ItemField

type ItemField struct {
	Value any
	Asset Asset
}

func NewItemFields(fields []*item.Field, sfields schema.FieldList, assets asset.List, urlResolver asset.URLResolver) ItemFields {
	return ItemFields(lo.SliceToMap(fields, func(f *item.Field) (string, ItemField) {
		k := ""
		if sf := sfields.Find(f.FieldID()); sf != nil {
			k = sf.Key().String()
		}
		if k == "" {
			k = f.FieldID().String()
		}

		a := Asset{}
		if aid, ok := f.Value().Value().ValueAsset(); ok {
			if as, ok := lo.Find(assets, func(a *asset.Asset) bool { return a.ID() == aid }); ok {
				a = NewAsset(as, urlResolver)
			}
		}

		return k, ItemField{
			Value: f.Value().Value().Interface(),
			Asset: a,
		}
	}))
}

func (i ItemField) MarshalJSON() ([]byte, error) {
	if i.Asset.Type != "" {
		return json.Marshal(i.Asset)
	}
	return json.Marshal(i.Value)
}

type Asset struct {
	Type        string `json:"type"`
	URL         string `json:"url,omitempty"`
	ContentType string `json:"contentType,omitempty"`
}

func NewAsset(a *asset.Asset, urlResolver asset.URLResolver) Asset {
	f := a.File()
	if f == nil {
		return Asset{}
	}

	u := ""
	if urlResolver != nil {
		u = urlResolver(a)
	}

	return Asset{
		Type:        "asset",
		URL:         u,
		ContentType: a.File().ContentType(),
	}
}
