package app

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/hellofresh/health-go/v5"
	"github.com/hellofresh/health-go/v5/checks/mongo"
	"github.com/labstack/echo/v4"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
)

type HealthChecker struct {
	health *health.Health
	config *Config
}

// NewHealthChecker creates a new health checker instance
func NewHealthChecker(conf *Config, ver string, fileRepo gateway.File) *HealthChecker {
	checks := []health.Config{
		{
			Name:      "db",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongo.New(mongo.Config{DSN: conf.DB}),
		},
	}

	for _, u := range conf.DB_Users {
		checks = append(checks, health.Config{
			Name:      "db-" + u.Name,
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongo.New(mongo.Config{DSN: u.URI}),
		})
	}

	if fileRepo != nil {
		checks = append(checks, health.Config{
			Name:      "storage",
			Timeout:   time.Second * 30,
			SkipOnErr: false,
			Check:     fileRepo.Check,
		})
	}

	for _, a := range conf.Auths() {
		if a.ISS != "" {
			u, err := url.Parse(a.ISS)
			if err != nil {
				log.Fatalf("invalid issuer URL: %v", err)
			}
			checks = append(checks, health.Config{
				Name:      "auth:" + a.ISS,
				Timeout:   time.Second * 10,
				SkipOnErr: false,
				Check: func(ctx context.Context) error {
					return authServerPingCheck(u.JoinPath(".well-known/openid-configuration").String())
				},
			})
		}
	}

	h, err := health.New(health.WithComponent(health.Component{
		Name:    "reearth-cms",
		Version: ver,
	}), health.WithChecks(checks...))
	if err != nil {
		log.Fatalf("failed to create health check: %v", err)
	}

	return &HealthChecker{
		health: h,
		config: conf,
	}
}

func (hc *HealthChecker) Check(ctx context.Context) error {
	log.Infof("health check: running health checks...")
	result := hc.health.Measure(ctx)
	if len(result.Failures) > 0 {
		return fmt.Errorf("health check failed: %v", result.Failures)
	}
	log.Infof("health check: all checks passed")
	return nil
}

func (hc *HealthChecker) Handler() echo.HandlerFunc {
	return func(c echo.Context) error {
		// Optional HTTP Basic Auth
		if hc.config.HealthCheck.Username != "" && hc.config.HealthCheck.Password != "" {
			username, password, ok := c.Request().BasicAuth()
			if !ok || username != hc.config.HealthCheck.Username || password != hc.config.HealthCheck.Password {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "unauthorized",
				})
			}
		}

		// Serve the health check
		hc.health.Handler().ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func authServerPingCheck(issuerURL string) (checkErr error) {
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Get(issuerURL)
	if err != nil {
		return fmt.Errorf("auth server unreachable: %v", err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			checkErr = fmt.Errorf("failed to close response body: %v", err)
		}
	}(resp.Body)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("auth server unhealthy, status: %d", resp.StatusCode)
	}
	return nil
}
