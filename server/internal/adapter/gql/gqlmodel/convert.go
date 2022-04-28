package gqlmodel

func RefToIndex(i *int) int {
	if i == nil {
		return -1
	}
	return *i
}

func RefToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

//func stringToRef(s string) *string {
//	if s == "" {
//		return nil
//	}
//	return &s
//}

func BoolToRef(b bool) *bool {
	return &b
}

//func ToPageInfo(p *usecase.PageInfo) *PageInfo {
//	if p == nil {
//		return &PageInfo{}
//	}
//	return &PageInfo{
//		StartCursor:     p.StartCursor(),
//		EndCursor:       p.EndCursor(),
//		HasNextPage:     p.HasNextPage(),
//		HasPreviousPage: p.HasPreviousPage(),
//	}
//}

//
//func ToPagination(pagination *Pagination) *usecase.Pagination {
//	if pagination == nil {
//		return nil
//	}
//	return &usecase.Pagination{
//		Before: pagination.Before,
//		After:  pagination.After,
//		First:  pagination.First,
//		Last:   pagination.Last,
//	}
//}
