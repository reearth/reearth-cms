package publicapi

import (
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/usecasex"
)

func ToItem(f *item.Item) Item {
	panic("implement")
}

func ToItemFields(f []*item.Field) map[string]any {
	panic("implement")
}

func ToListResult[T any](pi *usecasex.PageInfo) ListResult[T] {
	return ListResult[T]{
		TotalCount: pi.TotalCount,
		// Limit: pi.Limit,
		// Offset: pi.Offset,
	}
}
