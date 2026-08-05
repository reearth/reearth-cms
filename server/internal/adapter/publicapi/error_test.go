package publicapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPostItemErrorResponse(t *testing.T) {
	t.Parallel()

	e := echo.New()

	newCtx := func() (*echo.Context, *httptest.ResponseRecorder) {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		rec := httptest.NewRecorder()
		return e.NewContext(req, rec), rec
	}

	tests := []struct {
		name       string
		err        error
		wantStatus int
		wantCode   string
	}{
		{name: "not found", err: rerror.ErrNotFound, wantStatus: http.StatusNotFound, wantCode: codeNotFound},
		{name: "operation denied", err: interfaces.ErrOperationDenied, wantStatus: http.StatusForbidden, wantCode: codeAccessDenied},
		{name: "invalid operator", err: interfaces.ErrInvalidOperator, wantStatus: http.StatusForbidden, wantCode: codeAccessDenied},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			c, rec := newCtx()
			require.NoError(t, postItemErrorResponse(c, tt.err))
			assert.Equal(t, tt.wantStatus, rec.Code)

			var body apiErrorResponse
			require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
			assert.Equal(t, tt.wantCode, body.Code)
		})
	}

	t.Run("unmapped error is returned as-is", func(t *testing.T) {
		t.Parallel()

		c, _ := newCtx()
		unmapped := assert.AnError
		assert.Same(t, unmapped, postItemErrorResponse(c, unmapped))
	})
}
