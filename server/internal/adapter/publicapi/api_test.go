package publicapi

import (
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestPaginationFrom(t *testing.T) {
	e := echo.New()

	t.Run("cursor params", func(t *testing.T) {
		p := paginationFrom(e.NewContext(httptest.NewRequest("GET", "/?start_cursor=xxx&page_size=100", nil), nil))
		assert.Equal(t, &usecasex.Pagination{
			Cursor: &usecasex.CursorPagination{
				First: lo.ToPtr(int64(100)),
				After: usecasex.Cursor("xxx").Ref(),
			},
		}, p)
	})

	t.Run("offset params", func(t *testing.T) {
		p := paginationFrom(e.NewContext(httptest.NewRequest("GET", "/?offset=101&limit=101", nil), nil))
		assert.Equal(t, &usecasex.Pagination{
			Offset: &usecasex.OffsetPagination{
				Limit:  100,
				Offset: 101,
			},
		}, p)
	})

	t.Run("page params", func(t *testing.T) {
		p := paginationFrom(e.NewContext(httptest.NewRequest("GET", "/?page=3&perPage=100", nil), nil))
		assert.Equal(t, &usecasex.Pagination{
			Offset: &usecasex.OffsetPagination{
				Limit:  100,
				Offset: 200,
			},
		}, p)
	})

	t.Run("no params", func(t *testing.T) {
		p := paginationFrom(e.NewContext(httptest.NewRequest("GET", "/", nil), nil))
		assert.Nil(t, p)
	})
}
