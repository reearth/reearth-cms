package publicapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/labstack/echo/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRateLimitMiddleware(t *testing.T) {
	t.Parallel()

	newReq := func(ip string) (*echo.Context, *httptest.ResponseRecorder) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.Header.Set(echo.HeaderXRealIP, ip)
		rec := httptest.NewRecorder()
		return e.NewContext(req, rec), rec
	}

	okHandler := func(c *echo.Context) error {
		return c.NoContent(http.StatusAccepted)
	}

	t.Run("requests within the burst pass through", func(t *testing.T) {
		t.Parallel()
		// low rate so refill is negligible during the test; burst of 3.
		h := RateLimitMiddleware(0.01, 3)(okHandler)

		for i := 0; i < 3; i++ {
			c, rec := newReq("9.9.9.9")
			require.NoError(t, h(c))
			assert.Equal(t, http.StatusAccepted, rec.Code, "request %d should pass", i)
			assert.Empty(t, rec.Header().Get("Retry-After"))
		}
	})

	t.Run("request exceeding the burst returns 429 with Retry-After and rate_limited body", func(t *testing.T) {
		t.Parallel()
		// rate 0.5/s -> one token every 2s -> Retry-After = 2.
		h := RateLimitMiddleware(0.5, 1)(okHandler)

		c, _ := newReq("8.8.8.8")
		require.NoError(t, h(c))

		c, rec := newReq("8.8.8.8")
		require.NoError(t, h(c))

		assert.Equal(t, http.StatusTooManyRequests, rec.Code)

		secs, err := strconv.Atoi(rec.Header().Get("Retry-After"))
		require.NoError(t, err)
		assert.Equal(t, 2, secs)

		var resp apiErrorResponse
		require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
		assert.Equal(t, codeRateLimited, resp.Error)
		assert.Equal(t, codeRateLimited, resp.Code)
		assert.Equal(t, msgRateLimited, resp.Message)
	})

	t.Run("limits are tracked independently per IP", func(t *testing.T) {
		t.Parallel()
		h := RateLimitMiddleware(0.01, 1)(okHandler)

		c, rec := newReq("1.1.1.1")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusAccepted, rec.Code)

		c, rec = newReq("1.1.1.1")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusTooManyRequests, rec.Code)

		// a different IP has its own bucket
		c, rec = newReq("2.2.2.2")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusAccepted, rec.Code)
	})

	t.Run("non-positive rate and burst fall back to defaults", func(t *testing.T) {
		t.Parallel()
		// defaults: burst 100, so 100 requests pass and the 101st is denied.
		h := RateLimitMiddleware(0, 0)(okHandler)

		for i := 0; i < defaultBurst; i++ {
			c, rec := newReq("3.3.3.3")
			require.NoError(t, h(c))
			require.Equal(t, http.StatusAccepted, rec.Code, "request %d should pass", i)
		}

		c, rec := newReq("3.3.3.3")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusTooManyRequests, rec.Code)
		// default rate ~1.667/s -> one token in <1s -> Retry-After rounds up to 1.
		assert.Equal(t, "1", rec.Header().Get("Retry-After"))
	})
}
