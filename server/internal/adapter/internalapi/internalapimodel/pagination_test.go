package internalapimodel

import (
	"testing"

	"github.com/reearth/reearth-cms/server/internal/adapter/internalapi/schemas/internalapi/v1"
	"github.com/reearth/reearthx/usecasex"
	"github.com/stretchr/testify/assert"
)

func TestPaginationFromPB(t *testing.T) {
	tests := []struct {
		name     string
		input    *v1.PageInfo
		expected *usecasex.Pagination
	}{
		{
			name:     "nil input returns default pagination",
			input:    nil,
			expected: usecasex.OffsetPagination{Offset: 0, Limit: 50}.Wrap(),
		},
		{
			name: "page 2, pageSize 10",
			input: &v1.PageInfo{
				Page:     2,
				PageSize: 10,
			},
			expected: usecasex.OffsetPagination{Offset: 10, Limit: 10}.Wrap(),
		},
		{
			name: "page 1, pageSize 25",
			input: &v1.PageInfo{
				Page:     1,
				PageSize: 25,
			},
			expected: usecasex.OffsetPagination{Offset: 0, Limit: 25}.Wrap(),
		},
		{
			name: "page 0, pageSize 0",
			input: &v1.PageInfo{
				Page:     0,
				PageSize: 0,
			},
			expected: usecasex.OffsetPagination{Offset: -0, Limit: 0}.Wrap(),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := PaginationFromPB(tt.input)
			assert.Equal(t, tt.expected, got)
		})
	}
}

func TestToPageInfo(t *testing.T) {
	tests := []struct {
		name     string
		input    *v1.PageInfo
		expected *v1.PageInfo
	}{
		{
			name:     "nil input returns default PageInfo",
			input:    nil,
			expected: &v1.PageInfo{Page: 1, PageSize: 50},
		},
		{
			name:     "page 3, pageSize 15",
			input:    &v1.PageInfo{Page: 3, PageSize: 15},
			expected: &v1.PageInfo{Page: 3, PageSize: 15},
		},
		{
			name:     "page 0, pageSize 0",
			input:    &v1.PageInfo{Page: 0, PageSize: 0},
			expected: &v1.PageInfo{Page: 0, PageSize: 0},
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got := ToPageInfo(tt.input)
			assert.Equal(t, tt.expected, got)
		})
	}
}
