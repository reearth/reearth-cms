package publicapi

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

// ErrTooManyRequests is returned when a client exceeds the posting rate limit.
var ErrTooManyRequests = rerror.NewE(i18n.T("too many requests"))

// Default rate limiting parameters for the posting endpoint, per TI-2:
// per IP, fixed window, 100 requests per minute, system-wide.
const (
	defaultRateLimit  = 100
	defaultRateWindow = time.Minute
)

// fixedWindowLimiter is a per-key fixed-window request counter.
//
// Each key (an IP address) is allowed `limit` requests within a window of
// `window` duration. The window is anchored to the first request in it and
// resets once it elapses. This matches the fixed-window strategy defined in
// TI-2 and intentionally favours simplicity over smoothing burst behaviour at
// window boundaries.
//
// Counters are kept in process memory. This is sufficient for the phase-1
// minimum viable layer: the limit is a coarse system-wide safeguard, not a
// precise per-instance quota, and Cloud Armor remains the primary edge
// defence. A shared store can be introduced later without changing callers.
type fixedWindowLimiter struct {
	limit  int
	window time.Duration
	now    func() time.Time

	mu      sync.Mutex
	windows map[string]*windowCounter
}

type windowCounter struct {
	count   int
	resetAt time.Time
}

func newFixedWindowLimiter(limit int, window time.Duration, now func() time.Time) *fixedWindowLimiter {
	if limit <= 0 {
		limit = defaultRateLimit
	}
	if window <= 0 {
		window = defaultRateWindow
	}
	if now == nil {
		now = time.Now
	}
	return &fixedWindowLimiter{
		limit:   limit,
		window:  window,
		now:     now,
		windows: map[string]*windowCounter{},
	}
}

// allow records a request for key and reports whether it is within the limit.
// When the limit is exceeded it returns allowed=false and the duration the
// caller should wait before the current window resets (for Retry-After).
func (l *fixedWindowLimiter) allow(key string) (allowed bool, retryAfter time.Duration) {
	now := l.now()

	l.mu.Lock()
	defer l.mu.Unlock()

	w, ok := l.windows[key]
	if !ok || !now.Before(w.resetAt) {
		l.windows[key] = &windowCounter{count: 1, resetAt: now.Add(l.window)}
		return true, 0
	}

	if w.count >= l.limit {
		return false, w.resetAt.Sub(now)
	}

	w.count++
	return true, 0
}

// RateLimitMiddleware limits requests to the posting endpoint per client IP
// using a fixed window. Requests within the limit pass through unaffected;
// requests that exceed it are rejected with 429 and a Retry-After header.
//
// Passing limit<=0 or window<=0 falls back to the TI-2 defaults.
func RateLimitMiddleware(limit int, window time.Duration) echo.MiddlewareFunc {
	return rateLimitMiddleware(newFixedWindowLimiter(limit, window, nil))
}

func rateLimitMiddleware(l *fixedWindowLimiter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			allowed, retryAfter := l.allow(c.RealIP())
			if !allowed {
				// Round up to whole seconds so Retry-After is never 0 while
				// the window is still open.
				seconds := int(retryAfter.Seconds())
				if retryAfter > 0 && retryAfter%time.Second != 0 {
					seconds++
				}
				if seconds < 1 {
					seconds = 1
				}
				c.Response().Header().Set("Retry-After", strconv.Itoa(seconds))
				return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
			}
			return next(c)
		}
	}
}
