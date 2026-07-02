package publicapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRateLimitMiddleware(t *testing.T) {
	t.Parallel()

	e := echo.New()
	e.IPExtractor = echo.ExtractIPFromXFFHeader()

	newReq := func(ip string) (*echo.Context, *httptest.ResponseRecorder) {
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.RemoteAddr = "10.0.0.1:1234"
		req.Header.Set(echo.HeaderXForwardedFor, ip)
		rec := httptest.NewRecorder()
		return e.NewContext(req, rec), rec
	}

	okHandler := func(c *echo.Context) error {
		return c.NoContent(http.StatusAccepted)
	}

	cfg := func(rate float64, burst int) RateLimitConfig {
		return RateLimitConfig{Rate: rate, Burst: burst, ExpiresIn: time.Minute}
	}

	t.Run("requests within the burst pass through", func(t *testing.T) {
		t.Parallel()
		h := RateLimitMiddleware(cfg(0.01, 3))(okHandler)

		for i := 0; i < 3; i++ {
			c, rec := newReq("9.9.9.9")
			require.NoError(t, h(c))
			assert.Equal(t, http.StatusAccepted, rec.Code, "request %d should pass", i)
			assert.Empty(t, rec.Header().Get("Retry-After"))
		}
	})

	t.Run("request exceeding the burst returns 429 with Retry-After and rate_limited body", func(t *testing.T) {
		t.Parallel()
		h := RateLimitMiddleware(cfg(0.5, 1))(okHandler)

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
		h := RateLimitMiddleware(cfg(0.01, 1))(okHandler)

		c, rec := newReq("1.1.1.1")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusAccepted, rec.Code)

		c, rec = newReq("1.1.1.1")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusTooManyRequests, rec.Code)

		c, rec = newReq("2.2.2.2")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusAccepted, rec.Code)
	})

	t.Run("burst requests pass, then the next is denied", func(t *testing.T) {
		t.Parallel()
		const burst = 5
		h := RateLimitMiddleware(cfg(0.01, burst))(okHandler)

		for i := 0; i < burst; i++ {
			c, rec := newReq("3.3.3.3")
			require.NoError(t, h(c))
			require.Equal(t, http.StatusAccepted, rec.Code, "request %d should pass", i)
		}

		c, rec := newReq("3.3.3.3")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusTooManyRequests, rec.Code)
		assert.Equal(t, "500", rec.Header().Get("Retry-After"))
	})
}
