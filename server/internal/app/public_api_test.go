package app

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestPublicApiRateLimit(t *testing.T) {
	t.Run("nil context yields defaults", func(t *testing.T) {
		rl := publicApiRateLimit(nil)
		assert.InDelta(t, float64(defaultPublicRateLimitPerMinute)/60.0, rl.Rate, 1e-9)
		assert.Equal(t, defaultPublicRateLimitBurst, rl.Burst)
		assert.Equal(t, defaultPublicRateLimitExpires, rl.ExpiresIn)
	})

	t.Run("empty config falls back to defaults", func(t *testing.T) {
		rl := publicApiRateLimit(&ApplicationContext{Config: &Config{}})
		assert.InDelta(t, float64(defaultPublicRateLimitPerMinute)/60.0, rl.Rate, 1e-9)
		assert.Equal(t, defaultPublicRateLimitBurst, rl.Burst)
	})

	t.Run("converts per-minute rate to per-second and passes burst/expiresIn through", func(t *testing.T) {
		rl := publicApiRateLimit(&ApplicationContext{Config: &Config{
			Public_RateLimit: RateLimitConfig{RatePerMinute: 120, Burst: 20, ExpiresIn: 5 * time.Minute},
		}})
		assert.InDelta(t, 2.0, rl.Rate, 1e-9) // 120/min = 2/s
		assert.Equal(t, 20, rl.Burst)
		assert.Equal(t, 5*time.Minute, rl.ExpiresIn)
	})
}
