package gqlmodel

import (
	"io"

	"github.com/99designs/gqlgen/graphql"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
)

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

func (p *Pagination) Into() *usecasex.Pagination {
	if p == nil {
		return nil
	}
	if p.Offset != nil {
		return usecasex.OffsetPagination{
			Offset: int64(*p.Offset),
			Limit:  int64(*p.First),
		}.Wrap()
	}
	return usecasex.CursorPagination{
		Before: p.Before,
		After:  p.After,
		First:  pint2pint64(p.First),
		Last:   pint2pint64(p.Last),
	}.Wrap()
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

func pint2pint64(i *int) *int64 {
	if i == nil {
		return nil
	}
	return lo.ToPtr(int64(*i))
}
