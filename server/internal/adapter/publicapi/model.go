package publicapi

import (
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"golang.org/x/exp/maps"
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
	Fields map[string]any
}

func (i *Item) MarshalJSON() ([]byte, error) {
	m := maps.Clone(i.Fields)
	m["id"] = i.ID
	return json.Marshal(m)
}

type Asset struct {
	Type        string `json:"type"`
	URL         string `json:"url"`
	ContentType string `json:"contentType"`
	Size        uint64 `json:"size"`
}

func NewAsset(a *asset.Asset) Asset {
	return Asset{
		Type:        "asset",
		URL:         "",
		ContentType: a.File().ContentType(),
		Size:        a.Size(),
	}
}

func NewItem(f *item.Item) Item {
	return Item{
		ID:     f.ID().String(),
		Fields: NewItemFields(f.Fields()),
	}
}

func NewItemFields(f []*item.Field) map[string]any {
	return lo.SliceToMap(f, func(f *item.Field) (string, any) {
		return f.SchemaFieldID().String(), f.Value()
	})
}
