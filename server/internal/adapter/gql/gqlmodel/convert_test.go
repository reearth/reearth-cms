package gqlmodel

import (
	"testing"

	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestToPageInfo(t *testing.T) {
	tests := []struct {
		name string
		args *usecasex.PageInfo
		want *PageInfo
	}{
		{
			name: "nil",
			args: nil,
			want: &PageInfo{},
		},
		{
			name: "success",
			args: &usecasex.PageInfo{
				TotalCount:      0,
				StartCursor:     usecasex.CursorFromRef(lo.ToPtr("c1")),
				EndCursor:       nil,
				HasNextPage:     true,
				HasPreviousPage: false,
			},
			want: &PageInfo{
				StartCursor:     usecasex.CursorFromRef(lo.ToPtr("c1")),
				EndCursor:       nil,
				HasNextPage:     true,
				HasPreviousPage: false,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToPageInfo(tt.args))
		})
	}
}

func TestToPagination(t *testing.T) {
	tests := []struct {
		name string
		args *Pagination
		want *usecasex.Pagination
	}{
		{
			name: "nil",
			args: nil,
			want: nil,
		},
		{
			name: "success",
			args: &Pagination{
				First:  nil,
				Last:   nil,
				After:  nil,
				Before: nil,
			},
			want: &usecasex.Pagination{
				Before: nil,
				After:  nil,
				First:  nil,
				Last:   nil,
			},
		},
		{
			name: "success 2",
			args: &Pagination{
				First:  lo.ToPtr(10),
				Last:   nil,
				After:  usecasex.CursorFromRef(lo.ToPtr("c1")),
				Before: nil,
			},
			want: &usecasex.Pagination{
				Before: nil,
				After:  usecasex.CursorFromRef(lo.ToPtr("c1")),
				First:  lo.ToPtr(10),
				Last:   nil,
			},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, ToPagination(tt.args))
		})
	}
}
