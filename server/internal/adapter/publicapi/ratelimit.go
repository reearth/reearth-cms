package publicapi

import (
	"math"
	"net/http"
	"strconv"
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

	// retryAfter is an approximate hint (in whole seconds) of how long a denied
	// client should wait for the bucket to refill one token: ceil(1/rate), at
	// least 1. It's a fixed value derived from the rate rather than the exact
	// time to the next token, which is sufficient as a Retry-After hint.
	retryAfter := strconv.Itoa(int(math.Max(1, math.Ceil(1/ratePerSecond))))

	// The limiter keys on the client IP via the default IdentifierExtractor,
	// which calls c.RealIP(). The Echo instance is configured with a
	// spoof-resistant XFF extractor at app init (see initEcho), so behind the
	// Cloud Armor + GCLB proxy this resolves to the real client IP.
	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Store: store,
		DenyHandler: func(c *echo.Context, _ string, _ error) error {
			c.Response().Header().Set("Retry-After", retryAfter)
			return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
		},
	})
}
