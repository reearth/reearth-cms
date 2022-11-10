package integration

import (
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearthx/usecasex"
)

func toPagination(page, perPage *integrationapi.PageParam) *usecasex.Pagination {
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
