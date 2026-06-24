package publicapi

import (
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

// Default token-bucket parameters for the posting endpoint, per TI-2:
// per IP, ~100 requests per minute system-wide.
//
//	Rate  — sustained refill rate in requests per second (100/min ≈ 1.667/s).
//	Burst — maximum requests allowed instantaneously before throttling.
const (
	defaultRatePerSecond = 100.0 / 60.0
	defaultBurst         = 100
	// visitorExpiresIn is how long an idle per-IP limiter is retained before
	// the store evicts it. Comfortably larger than the refill window.
	visitorExpiresIn = 3 * time.Minute
)

// RateLimitMiddleware limits requests to the posting endpoint per client IP
// using a token bucket (Echo's built-in rate limiter). Requests within the
// limit pass through unaffected; requests that exceed it are rejected with 429
// and a Retry-After header.
//
// ratePerSecond is the sustained refill rate; burst is the maximum number of
// requests allowed at once. Non-positive values fall back to the TI-2 defaults.
func RateLimitMiddleware(ratePerSecond float64, burst int) echo.MiddlewareFunc {
	if ratePerSecond <= 0 {
		ratePerSecond = defaultRatePerSecond
	}
	if burst <= 0 {
		burst = defaultBurst
	}

	store := middleware.NewRateLimiterMemoryStoreWithConfig(middleware.RateLimiterMemoryStoreConfig{
		Rate:      ratePerSecond,
		Burst:     burst,
		ExpiresIn: visitorExpiresIn,
	})

	// retryAfter is the number of whole seconds a denied client must wait for
	// the bucket to refill one token. ceil(1/rate), at least 1.
	retryAfter := strconv.Itoa(int(math.Max(1, math.Ceil(1/ratePerSecond))))

	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Store:               store,
		IdentifierExtractor: clientIPExtractor,
		DenyHandler: func(c *echo.Context, _ string, _ error) error {
			c.Response().Header().Set("Retry-After", retryAfter)
			return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
		},
	})
}

// clientIPExtractor keys the limiter on the originating client IP. The posting
// endpoint runs behind a proxy/load balancer (Cloud Armor + GCLB), so the real
// client IP is the leftmost entry of X-Forwarded-For. We read it directly
// rather than echo's RealIP(), which by default does not trust forwarding
// headers and would collapse every client onto the proxy's IP — one shared
// bucket for all traffic. Falls back to X-Real-IP, then the direct RemoteAddr.
func clientIPExtractor(c *echo.Context) (string, error) {
	if xff := c.Request().Header.Get("X-Forwarded-For"); xff != "" {
		if first := strings.TrimSpace(strings.SplitN(xff, ",", 2)[0]); first != "" {
			return first, nil
		}
	}
	if xrip := strings.TrimSpace(c.Request().Header.Get("X-Real-IP")); xrip != "" {
		return xrip, nil
	}
	return c.RealIP(), nil
}
