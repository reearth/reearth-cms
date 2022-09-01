package gqlmodel

import (
	(
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearthx/usecasex"
)
	"github.com/reearth/reearth-cms/server/pkg/file"
)

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

func BoolToRef(b bool) *bool {
	return &b
}

func ToPageInfo(p *usecasex.PageInfo) *PageInfo {
	if p == nil {
		return &PageInfo{}
	}
	return &PageInfo{
		StartCursor:     p.StartCursor,
		EndCursor:       p.EndCursor,
		HasNextPage:     p.HasNextPage,
		HasPreviousPage: p.HasPreviousPage,
	}
}

func ToPagination(pagination *Pagination) *usecasex.Pagination {
	if pagination == nil {
		return nil
	}
	return &usecasex.Pagination{
		Before: pagination.Before,
		After:  pagination.After,
		First:  pagination.First,
		Last:   pagination.Last,
	}
}

func FromFile(f *graphql.Upload) *file.File {
	if f == nil {
		return nil
	}
	return &file.File{
		Content:     io.NopCloser(f.File),
		Path:        f.Filename,
		Size:        f.Size,
		ContentType: f.ContentType,
	}
}
