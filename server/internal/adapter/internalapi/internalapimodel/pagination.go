package internalapimodel

import (
	v1 "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearthx/usecasex"
)

func PaginationFromPB(p *v1.PageInfo) *usecasex.Pagination {
	if p == nil {
		return usecasex.OffsetPagination{
			Offset: 0,
			Limit:  50,
		}.Wrap()
	}

	return usecasex.OffsetPagination{
		Offset: int64(p.Page-1) * int64(p.PageSize),
		Limit:  int64(p.PageSize),
	}.Wrap()
}

func ToPageInfo(p *v1.PageInfo) *v1.PageInfo {
	if p == nil {
		return &v1.PageInfo{
			Page:     1,
			PageSize: 50,
		}
	}
	return &v1.PageInfo{
		Page:     p.Page,
		PageSize: p.PageSize,
	}
}
