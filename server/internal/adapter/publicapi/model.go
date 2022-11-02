package publicApi

import (
	"encoding/json"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/usecasex"
	"golang.org/x/exp/maps"
)

type ListResult[T any] struct {
	Results    []T `json:"results"`
	TotalCount int `json:"totalCount"`
	Limit      int `json:"limit"`
	Offset     int `json:"offset"`
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

func NewListResult[T any](results []T, limit, offset int, pi *usecasex.PageInfo) ListResult[T] {
	return ListResult[T]{
		Results:    results,
		TotalCount: pi.TotalCount,
		Limit:      limit,
		Offset:     offset,
	}
}

func NewItem(i *item.Item, s *schema.Schema) Item {
	fields := map[string]any{}
	for _, f := range i.Fields() {
		sf := s.Fields().FindByID(f.SchemaFieldID())
		if sf == nil || f.Value().Type() != value.Type(sf.Type()) {
			continue
		}

		k := sf.Key().String()
		fields[k] = NewItemField(f, sf)
	}

	return Item{
		ID:     i.ID().String(),
		Fields: fields,
	}
}

func NewItemField(f *item.Field, _ *schema.Field) (res any) {
	v := f.Value().Value()
	if v == nil {
		return
	}
	switch v {
	case value.TypeText:
		if v != nil {
			return v
		}
	case value.TypeTextArea:
		if v != nil {
			return v
		}
	case value.TypeRichText:
		if v != nil {
			return v
		}
	case value.TypeMarkdown:
		if v != nil {
			return v
		}
	case value.TypeDate:
		if v != nil {
			// v, _ = time.Parse(time.RFC3339, string(v))
			return v
		}
	case value.TypeAsset:
		if v != nil {
			return v
		}
	case value.TypeBool:
		if v != nil {
			return v
		}
	case value.TypeSelect:
		if v != nil {
			return v
		}
	case value.TypeTag:
		if v != nil {
			return v
		}
	case value.TypeInteger:
		if v != nil {
			return v
		}
	case value.TypeReference:
		if v != nil {
			return v
		}
	case value.TypeURL:
		if v != nil {
			return v
		}
	case value.TypeUnknown:
		if v != nil {
			return v
		}
	}
	return v
}

func NewAsset(a *asset.Asset) Asset {
	return Asset{
		Type:        "asset",
		URL:         "",
		ContentType: a.File().ContentType(),
		Size:        a.Size(),
	}
}
