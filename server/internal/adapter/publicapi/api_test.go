package publicapi

import (
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/usecasex"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestParseSubRoute(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		input    string
		wantName string
		wantExt  string
	}{
		// compound extensions
		{name: "metadata_schema.json", input: "myModel.metadata_schema.json", wantName: "myModel", wantExt: ".metadata_schema.json"},
		{name: "schema.json", input: "myModel.schema.json", wantName: "myModel", wantExt: ".schema.json"},
		{name: "geojson", input: "myModel.geojson", wantName: "myModel", wantExt: ".geojson"},
		// simple extensions
		{name: "json", input: "myModel.json", wantName: "myModel", wantExt: ".json"},
		{name: "csv", input: "myModel.csv", wantName: "myModel", wantExt: ".csv"},
		// no extension
		{name: "no extension", input: "myModel", wantName: "myModel", wantExt: ""},
		{name: "assets no extension", input: "assets", wantName: "assets", wantExt: ""},
		// case insensitive extension matching, original case preserved in name
		{name: "uppercase JSON extension", input: "MyModel.JSON", wantName: "MyModel", wantExt: ".json"},
		{name: "mixed case schema.json", input: "MyModel.Schema.JSON", wantName: "MyModel", wantExt: ".schema.json"},
		{name: "mixed case GeoJSON", input: "MyModel.GeoJSON", wantName: "MyModel", wantExt: ".geojson"},
		// unknown extension
		{name: "unknown extension", input: "myModel.zip", wantName: "myModel", wantExt: ".zip"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			name, ext := parseSubRoute(tt.input)
			assert.Equal(t, tt.wantName, name)
			assert.Equal(t, tt.wantExt, ext)
		})
	}
}

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
