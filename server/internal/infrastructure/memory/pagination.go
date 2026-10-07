package memory

import (
	"cmp"
	"errors"
	"slices"
	"strings"

	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

const defaultPageSize = 20

type compareFunc[T any] func(a, b T) int

type pager[T any] struct {
	id   func(T) string
	keys map[string]compareFunc[T]
	find func(cursor usecasex.Cursor) (T, bool)
}

func (pg pager[T]) paginate(l []T, s *usecasex.Sort, p *usecasex.Pagination) ([]T, *usecasex.PageInfo, error) {
	if p == nil || (p.Cursor == nil && p.Offset == nil) {
		return nil, nil, nil
	}

	compare := pg.compare(s)
	sorted := slices.SortedFunc(slices.Values(l), compare)
	totalCount := int64(len(sorted))

	if p.Cursor != nil {
		cursor, after := p.Cursor.After, true
		if cursor == nil {
			cursor, after = p.Cursor.Before, false
		}
		if cursor != nil {
			ce, ok := pg.find(*cursor)
			if !ok {
				return nil, nil, rerror.ErrInternalBy(errors.New("failed to find cursor element"))
			}
			sorted = slices.DeleteFunc(sorted, func(e T) bool {
				if after {
					return compare(e, ce) <= 0
				}
				return compare(e, ce) >= 0
			})
		}
	}

	if p.Offset != nil {
		sorted = sorted[min(int(max(p.Offset.Offset, 0)), len(sorted)):]
	}

	last := p.Cursor != nil && p.Cursor.Last != nil
	limit := pageSize(p)
	hasMore := len(sorted) > limit
	var page []T
	if last {
		page = sorted[max(len(sorted)-limit, 0):]
	} else {
		page = sorted[:min(limit, len(sorted))]
	}

	var startCursor, endCursor *usecasex.Cursor
	if len(page) > 0 {
		startCursor = new(usecasex.Cursor(pg.id(page[0])))
		endCursor = new(usecasex.Cursor(pg.id(page[len(page)-1])))
	} else {
		page = nil
	}

	hasNextPage := (p.Cursor != nil && p.Cursor.First != nil || p.Offset != nil) && hasMore
	hasPreviousPage := last && hasMore
	return page, usecasex.NewPageInfo(totalCount, startCursor, endCursor, hasNextPage, hasPreviousPage), nil
}

func (pg pager[T]) compare(s *usecasex.Sort) compareFunc[T] {
	var byKey compareFunc[T]
	reverted := false
	if s != nil && s.Key != "" {
		byKey = pg.keys[s.Key]
		reverted = s.Reverted
	}
	return func(a, b T) int {
		c := 0
		if byKey != nil {
			c = byKey(a, b)
		}
		c = cmp.Or(c, strings.Compare(pg.id(a), pg.id(b)))
		if reverted {
			return -c
		}
		return c
	}
}

func pageSize(p *usecasex.Pagination) int {
	var size *int64
	if p.Offset != nil {
		size = &p.Offset.Limit
	} else if p.Cursor.First != nil {
		size = p.Cursor.First
	} else if p.Cursor.Last != nil {
		size = p.Cursor.Last
	}
	if size != nil && *size > 0 {
		return int(*size)
	}
	return defaultPageSize
}
