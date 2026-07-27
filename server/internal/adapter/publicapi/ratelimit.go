package publicapi

import (
	"math"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

// RateLimitMiddleware builds the posting endpoint's per-IP token-bucket rate
func RateLimitMiddleware(rl RateLimitConfig) echo.MiddlewareFunc {
	store := middleware.NewRateLimiterMemoryStoreWithConfig(middleware.RateLimiterMemoryStoreConfig{
		Rate:      rl.Rate,
		Burst:     rl.Burst,
		ExpiresIn: rl.ExpiresIn,
	})

	// Retry-After hint in whole seconds ≈ time to drain then refill the full burst: ceil(burst/rate).
	// Clamp to at least 1 so clients don't interpret Retry-After: 0 as "retry immediately".
	ra := 1
	if rl.Rate > 0 {
		ra = max(int(math.Ceil(float64(rl.Burst)/rl.Rate)), 1)
	}
	retryAfter := strconv.Itoa(ra)

	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Store: store,
		DenyHandler: func(c *echo.Context, _ string, _ error) error {
			c.Response().Header().Set("Retry-After", retryAfter)
			return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
		},
	})
}
