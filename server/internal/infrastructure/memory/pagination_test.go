package memory

import (
	"cmp"
	"testing"

	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

type pageElem struct {
	id string
	n  int
}

func TestPager_Paginate(t *testing.T) {
	// IDs ascend from a to d while n descends, so sorting by the ID and by n
	// give opposite orders
	a, b, c, d := pageElem{"a", 4}, pageElem{"b", 3}, pageElem{"c", 2}, pageElem{"d", 1}
	elems := []pageElem{c, a, d, b}
	pg := pager[pageElem]{
		id:   func(e pageElem) string { return e.id },
		keys: map[string]compareFunc[pageElem]{"n": func(x, y pageElem) int { return cmp.Compare(x.n, y.n) }},
		find: func(cur usecasex.Cursor) (pageElem, bool) {
			return lo.Find(elems, func(e pageElem) bool { return e.id == string(cur) })
		},
	}
	cursor := func(e pageElem) *usecasex.Cursor { return new(usecasex.Cursor(e.id)) }
	firstN := func(n int64) *usecasex.Pagination { return usecasex.CursorPagination{First: new(n)}.Wrap() }
	lastN := func(n int64) *usecasex.Pagination { return usecasex.CursorPagination{Last: new(n)}.Wrap() }

	tests := []struct {
		name     string
		elems    []pageElem
		sort     *usecasex.Sort
		p        *usecasex.Pagination
		want     []pageElem
		wantInfo *usecasex.PageInfo
		wantErr  bool
	}{
		{
			name:  "nil pagination returns nothing",
			elems: elems,
			p:     nil,
		},
		{
			name:  "pagination without cursor or offset returns nothing",
			elems: elems,
			p:     &usecasex.Pagination{},
		},
		{
			name:     "first page in ID order",
			elems:    elems,
			p:        firstN(2),
			want:     []pageElem{a, b},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(b), true, false),
		},
		{
			name:     "first page larger than the results",
			elems:    elems,
			p:        firstN(10),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "exactly one full page has no next page",
			elems:    elems,
			p:        firstN(4),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "default page size",
			elems:    elems,
			p:        usecasex.CursorPagination{}.Wrap(),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "non-positive page size falls back to the default",
			elems:    elems,
			p:        firstN(0),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "last page with the start cursor at its end, like mongo",
			elems:    elems,
			p:        lastN(2),
			want:     []pageElem{c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(d), cursor(c), false, true),
		},
		{
			name:     "after a cursor",
			elems:    elems,
			p:        usecasex.CursorPagination{After: cursor(a), First: new(int64(2))}.Wrap(),
			want:     []pageElem{b, c},
			wantInfo: usecasex.NewPageInfo(4, cursor(b), cursor(c), true, false),
		},
		{
			name:     "before a cursor",
			elems:    elems,
			p:        usecasex.CursorPagination{Before: cursor(d), Last: new(int64(2))}.Wrap(),
			want:     []pageElem{b, c},
			wantInfo: usecasex.NewPageInfo(4, cursor(c), cursor(b), false, true),
		},
		{
			name:     "after takes precedence over before",
			elems:    elems,
			p:        usecasex.CursorPagination{After: cursor(b), Before: cursor(c), First: new(int64(10))}.Wrap(),
			want:     []pageElem{c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(c), cursor(d), false, false),
		},
		{
			name: "cursor outside the results",
			// the cursor element is looked up in the whole collection
			elems:    []pageElem{a, c, d},
			p:        usecasex.CursorPagination{After: cursor(b), First: new(int64(10))}.Wrap(),
			want:     []pageElem{c, d},
			wantInfo: usecasex.NewPageInfo(3, cursor(c), cursor(d), false, false),
		},
		{
			name:    "unknown cursor",
			elems:   elems,
			p:       usecasex.CursorPagination{After: new(usecasex.Cursor("x")), First: new(int64(10))}.Wrap(),
			wantErr: true,
		},
		{
			name:     "offset",
			elems:    elems,
			p:        usecasex.OffsetPagination{Offset: 1, Limit: 2}.Wrap(),
			want:     []pageElem{b, c},
			wantInfo: usecasex.NewPageInfo(4, cursor(b), cursor(c), true, false),
		},
		{
			name:     "offset beyond the results",
			elems:    elems,
			p:        usecasex.OffsetPagination{Offset: 10, Limit: 2}.Wrap(),
			wantInfo: usecasex.NewPageInfo(4, nil, nil, false, false),
		},
		{
			name:     "sort key",
			elems:    elems,
			sort:     &usecasex.Sort{Key: "n"},
			p:        firstN(10),
			want:     []pageElem{d, c, b, a},
			wantInfo: usecasex.NewPageInfo(4, cursor(d), cursor(a), false, false),
		},
		{
			name:     "sort key reverted",
			elems:    elems,
			sort:     &usecasex.Sort{Key: "n", Reverted: true},
			p:        firstN(10),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "after a cursor with a sort key",
			elems:    elems,
			sort:     &usecasex.Sort{Key: "n"},
			p:        usecasex.CursorPagination{After: cursor(c), First: new(int64(10))}.Wrap(),
			want:     []pageElem{b, a},
			wantInfo: usecasex.NewPageInfo(4, cursor(b), cursor(a), false, false),
		},
		{
			name:     "before a cursor with a reverted sort key",
			elems:    elems,
			sort:     &usecasex.Sort{Key: "n", Reverted: true},
			p:        usecasex.CursorPagination{Before: cursor(c), Last: new(int64(10))}.Wrap(),
			want:     []pageElem{a, b},
			wantInfo: usecasex.NewPageInfo(4, cursor(b), cursor(a), false, false),
		},
		{
			name:     "unknown sort key orders by ID like a missing mongo field",
			elems:    elems,
			sort:     &usecasex.Sort{Key: "unknown", Reverted: true},
			p:        firstN(10),
			want:     []pageElem{d, c, b, a},
			wantInfo: usecasex.NewPageInfo(4, cursor(d), cursor(a), false, false),
		},
		{
			name:     "direction is ignored without a sort key",
			elems:    elems,
			sort:     &usecasex.Sort{Reverted: true},
			p:        firstN(10),
			want:     []pageElem{a, b, c, d},
			wantInfo: usecasex.NewPageInfo(4, cursor(a), cursor(d), false, false),
		},
		{
			name:     "empty results",
			p:        firstN(10),
			wantInfo: usecasex.NewPageInfo(0, nil, nil, false, false),
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			t.Parallel()

			input := append([]pageElem(nil), tc.elems...)
			got, info, err := pg.paginate(input, tc.sort, tc.p)
			if tc.wantErr {
				assert.Nil(t, got)
				assert.Nil(t, info)
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Equal(t, tc.want, got)
			assert.Equal(t, tc.wantInfo, info)
			// the input must not be reordered
			assert.Equal(t, tc.elems, input)
		})
	}
}
