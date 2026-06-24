package publicapi

import (
	"math"
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

const (
	defaultRatePerSecond = 100.0 / 60.0
	defaultBurst         = 100
	visitorExpiresIn = 3 * time.Minute
)

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

	retryAfter := strconv.Itoa(int(math.Max(1, math.Ceil(1/ratePerSecond))))

	return middleware.RateLimiterWithConfig(middleware.RateLimiterConfig{
		Store: store,
		DenyHandler: func(c *echo.Context, _ string, _ error) error {
			c.Response().Header().Set("Retry-After", retryAfter)
			return c.JSON(http.StatusTooManyRequests, newAPIError(codeRateLimited, msgRateLimited, nil))
		},
	})
}
