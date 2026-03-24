package internalapimodel

import (
	v1 "github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearth-cms/server/pkg/item/view"
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

func SortFromPB(s *v1.SortInfo) *usecasex.Sort {
	if s == nil {
		return nil
	}

	return &usecasex.Sort{
		Key:      s.Key,
		Reverted: s.Reverted,
	}
}

func SortToViewSort(s *v1.SortInfo) *view.Sort {

	if s == nil {
		return nil
	}

	direction := view.DirectionAsc
	if s.Reverted {
		direction = view.DirectionDesc
	}

	var fieldType view.FieldType
	switch s.Key {
	case "createdAt", "created_at":
		fieldType = view.FieldTypeCreationDate
	case "updatedAt", "updated_at":
		fieldType = view.FieldTypeModificationDate
	case "id":
		fieldType = view.FieldTypeId
	case "status":
		fieldType = view.FieldTypeStatus
	default:
		fieldType = view.FieldTypeField
	}

	return &view.Sort{
		Field: view.FieldSelector{
			Type: fieldType,
			ID:   nil,
		},
		Direction: direction,
	}
}
