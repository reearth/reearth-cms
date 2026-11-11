package serve

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type ctxKey struct{}

func TestTokenTransport(t *testing.T) {
	t.Parallel()

	fromCtx := func(ctx context.Context) string {
		s, _ := ctx.Value(ctxKey{}).(string)
		return s
	}

	tests := []struct {
		name     string
		token    TokenFunc
		ctxToken string
		want     string
	}{
		{name: "token from context", token: fromCtx, ctxToken: "jwt", want: "Bearer jwt"},
		{name: "empty token", token: fromCtx, want: ""},
		{name: "nil token func", token: nil, ctxToken: "jwt", want: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var got string
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				got = r.Header.Get("Authorization")
			}))
			t.Cleanup(srv.Close)

			ctx := context.WithValue(context.Background(), ctxKey{}, tt.ctxToken)
			req, err := http.NewRequestWithContext(ctx, http.MethodGet, srv.URL, nil)
			require.NoError(t, err)

			res, err := (&http.Client{Transport: NewTokenTransport(nil, tt.token)}).Do(req)
			require.NoError(t, err)
			_ = res.Body.Close()

			assert.Equal(t, tt.want, got)
			assert.Empty(t, req.Header.Get("Authorization"), "the caller's request must not be mutated")
		})
	}
}
