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

	// Retry-After hint in whole seconds ≈ time to refill one token: ceil(1/rate).
	retryAfter := strconv.Itoa(int(math.Ceil(1 / rl.Rate)))

	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Store: store,
		DenyHandler: func(c *echo.Context, _ string, _ error) error {
			c.Response().Header().Set("Retry-After", retryAfter)
			return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
		},
	})
}
