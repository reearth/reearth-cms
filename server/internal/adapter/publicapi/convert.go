package publicapi

import (
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func ToItem(f *item.Item) Item {
	return Item{
		ID:     f.ID().String(),
		Fields: ToItemFields(f.Fields()),
	}
}

func ToItemFields(f []*item.Field) map[string]any {
	return lo.SliceToMap(f, func(f *item.Field) (string, any) {
		return f.SchemaFieldID().String(), f.Value()
	})
}

func ToListResult[T any](pi *usecasex.PageInfo, limit, offset int) ListResult[T] {
	return ListResult[T]{
		TotalCount: int64(pi.TotalCount),
		Limit:      lmit,
		Offset:     offset,
	}
}
