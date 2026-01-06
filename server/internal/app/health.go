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

// HealthCheck returns an echo.HandlerFunc that serves the health check endpoint
func HealthCheck(conf *Config, ver string, fileRepo gateway.File) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Optional HTTP Basic Auth
		if conf.HealthCheck.Username != "" && conf.HealthCheck.Password != "" {
			username, password, ok := c.Request().BasicAuth()
			if !ok || username != conf.HealthCheck.Username || password != conf.HealthCheck.Password {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"error": "unauthorized",
				})
			}
		}

		// Serve the health check
		h := healthCheck(conf, ver, fileRepo)
		h.Handler().ServeHTTP(c.Response(), c.Request())
		return nil
	}
}

func healthCheck(conf *Config, ver string, fileRepo gateway.File) *health.Health {
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
	return h
}

// RunInitialHealthCheck performs health checks on initialization
func RunInitialHealthCheck(ctx context.Context, conf *Config, ver string, fileRepo gateway.File) error {
	log.Infof("health check: running initial health checks...")
	h := healthCheck(conf, ver, fileRepo)
	result := h.Measure(ctx)
	if len(result.Failures) > 0 {
		return fmt.Errorf("initial health check failed: %v", result.Failures)
	}
	log.Infof("health check: all checks passed")
	return nil
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
