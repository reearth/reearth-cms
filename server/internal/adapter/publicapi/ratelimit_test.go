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

func TestFixedWindowLimiter_Allow(t *testing.T) {
	t.Parallel()

	base := time.Date(2026, 6, 22, 0, 0, 0, 0, time.UTC)

	t.Run("requests within the limit are allowed", func(t *testing.T) {
		t.Parallel()
		l := newFixedWindowLimiter(3, time.Minute, func() time.Time { return base })

		for i := 0; i < 3; i++ {
			allowed, retryAfter := l.allow("1.2.3.4")
			assert.True(t, allowed, "request %d should be allowed", i)
			assert.Zero(t, retryAfter)
		}
	})

	t.Run("request exceeding the limit is rejected with retry-after", func(t *testing.T) {
		t.Parallel()
		now := base
		l := newFixedWindowLimiter(2, time.Minute, func() time.Time { return now })

		_, _ = l.allow("1.2.3.4")
		_, _ = l.allow("1.2.3.4")

		// advance 20s within the same window
		now = base.Add(20 * time.Second)
		allowed, retryAfter := l.allow("1.2.3.4")
		assert.False(t, allowed)
		assert.Equal(t, 40*time.Second, retryAfter, "retry-after should cover the rest of the window")
	})

	t.Run("window resets after it elapses", func(t *testing.T) {
		t.Parallel()
		now := base
		l := newFixedWindowLimiter(1, time.Minute, func() time.Time { return now })

		allowed, _ := l.allow("1.2.3.4")
		require.True(t, allowed)

		allowed, _ = l.allow("1.2.3.4")
		require.False(t, allowed)

		// advance past the window boundary
		now = base.Add(time.Minute)
		allowed, retryAfter := l.allow("1.2.3.4")
		assert.True(t, allowed)
		assert.Zero(t, retryAfter)
	})

	t.Run("limits are tracked independently per key", func(t *testing.T) {
		t.Parallel()
		l := newFixedWindowLimiter(1, time.Minute, func() time.Time { return base })

		allowed, _ := l.allow("1.1.1.1")
		assert.True(t, allowed)
		allowed, _ = l.allow("1.1.1.1")
		assert.False(t, allowed)

		// a different IP has its own window
		allowed, _ = l.allow("2.2.2.2")
		assert.True(t, allowed)
	})

	t.Run("non-positive limit and window fall back to defaults", func(t *testing.T) {
		t.Parallel()
		l := newFixedWindowLimiter(0, 0, nil)
		assert.Equal(t, defaultRateLimit, l.limit)
		assert.Equal(t, defaultRateWindow, l.window)
	})
}

func TestRateLimitMiddleware(t *testing.T) {
	t.Parallel()

	base := time.Date(2026, 6, 22, 0, 0, 0, 0, time.UTC)

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

	t.Run("passes through requests within the limit", func(t *testing.T) {
		t.Parallel()
		l := newFixedWindowLimiter(2, time.Minute, func() time.Time { return base })
		h := rateLimitMiddleware(l)(okHandler)

		c, rec := newReq("9.9.9.9")
		require.NoError(t, h(c))
		assert.Equal(t, http.StatusAccepted, rec.Code)
		assert.Empty(t, rec.Header().Get("Retry-After"))
	})

	t.Run("rejects with 429, Retry-After header and rate_limited body", func(t *testing.T) {
		t.Parallel()
		now := base
		l := newFixedWindowLimiter(1, time.Minute, func() time.Time { return now })
		h := rateLimitMiddleware(l)(okHandler)

		c, _ := newReq("8.8.8.8")
		require.NoError(t, h(c))

		// advance 10s; 50s remain in the window
		now = base.Add(10 * time.Second)
		c, rec := newReq("8.8.8.8")
		require.NoError(t, h(c))

		assert.Equal(t, http.StatusTooManyRequests, rec.Code)

		retryAfter := rec.Header().Get("Retry-After")
		secs, err := strconv.Atoi(retryAfter)
		require.NoError(t, err)
		assert.Equal(t, 50, secs)

		var resp apiErrorResponse
		require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
		assert.Equal(t, codeRateLimited, resp.Error)
		assert.Equal(t, codeRateLimited, resp.Code)
		assert.Equal(t, msgRateLimited, resp.Message)
	})

	t.Run("Retry-After is at least 1 second and rounds up sub-second remainders", func(t *testing.T) {
		t.Parallel()
		now := base
		l := newFixedWindowLimiter(1, time.Minute, func() time.Time { return now })
		h := rateLimitMiddleware(l)(okHandler)

		c, _ := newReq("7.7.7.7")
		require.NoError(t, h(c))

		// 59.5s elapsed -> 0.5s remains, must round up to 1
		now = base.Add(59500 * time.Millisecond)
		c, rec := newReq("7.7.7.7")
		require.NoError(t, h(c))

		assert.Equal(t, http.StatusTooManyRequests, rec.Code)
		assert.Equal(t, "1", rec.Header().Get("Retry-After"))
	})
}
