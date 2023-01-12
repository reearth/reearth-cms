package integration

import (
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/key"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

func fromPagination(page, perPage *integrationapi.PageParam) *usecasex.Pagination {
	p := int64(1)
	if page != nil && *page > 0 {
		p = int64(*page)
	}
	pp := int64(50)
	if perPage != nil && 1 >= *perPage && *perPage <= 100 {
		pp = int64(*perPage)
	}
	return usecasex.OffsetPagination{
		Offset: (p - 1) * pp,
		Limit:  pp,
	}.Wrap()
}

func fromItemFieldParam(f integrationapi.Field) interfaces.ItemFieldParam {
	var v any = f.Value
	if f.Value != nil {
		v = *f.Value
	}

	var k *key.Key
	if f.Key != nil {
		k = lo.ToPtr(key.New(*f.Key))
	}

	return interfaces.ItemFieldParam{
		Field: f.Id,
		Key:   k,
		Type:  integrationapi.FromValueType(f.Type),
		Value: v,
	}
}
