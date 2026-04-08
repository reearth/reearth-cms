package app

import (
	"errors"
	"net/http"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

func TestErrorMessage(t *testing.T) {
	t.Parallel()

	nopLog := func(string, ...interface{}) {}

	tests := []struct {
		name     string
		err      error
		wantCode int
		wantMsg  string
	}{
		{
			name:     "echo HTTPError",
			err:      echo.NewHTTPError(http.StatusForbidden, "forbidden"),
			wantCode: http.StatusForbidden,
			wantMsg:  "forbidden",
		},
		{
			name:     "rerror ErrNotFound",
			err:      rerror.ErrNotFound,
			wantCode: http.StatusNotFound,
			wantMsg:  "not found",
		},
		{
			name:     "rerror ErrTooManyRequests",
			err:      rerror.ErrTooManyRequests,
			wantCode: http.StatusTooManyRequests,
			wantMsg:  "too many requests",
		},
		{
			name:     "rerror E (bad request)",
			err:      rerror.ErrInvalidParams,
			wantCode: http.StatusBadRequest,
			wantMsg:  "invalid params",
		},
		{
			name:     "gqlerror",
			err:      &gqlerror.Error{Message: "graphql error"},
			wantCode: http.StatusBadRequest,
			wantMsg:  "input: graphql error",
		},
		{
			name:     "unknown error defaults to 500",
			err:      errors.New("unexpected"),
			wantCode: http.StatusInternalServerError,
			wantMsg:  "internal server error",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			code, msg := errorMessage(tt.err, nopLog)
			assert.Equal(t, tt.wantCode, code)
			assert.Equal(t, tt.wantMsg, msg)
		})
	}
}
