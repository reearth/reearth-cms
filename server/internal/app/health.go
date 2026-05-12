package app

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/hellofresh/health-go/v5"
	httpCheck "github.com/hellofresh/health-go/v5/checks/http"
	mongoCheck "github.com/hellofresh/health-go/v5/checks/mongo"
	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
	"go.opentelemetry.io/otel"
)

type HealthChecker struct {
	health *health.Health
	config *Config
}

func (hc *HealthChecker) Handler() echo.HandlerFunc {
	return func(c *echo.Context) error {
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

func NewHealthChecker(conf *Config, ver string, gateways *gateway.Container) *HealthChecker {
	checks := []health.Config{
		{
			Name:      "db",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongoCheck.New(mongoCheck.Config{DSN: conf.DB}),
		},
	}

	for _, u := range conf.DB_Users {
		checks = append(checks, health.Config{
			Name:      "db-" + u.Name,
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     mongoCheck.New(mongoCheck.Config{DSN: u.URI}),
		})
	}

	if gateways != nil && gateways.File != nil {
		checks = append(checks, health.Config{
			Name:      "storage",
			Timeout:   time.Second * 30,
			SkipOnErr: false,
			Check:     gateways.File.Check,
		})
	}

	// Add task runner health check if configured
	if gateways != nil && gateways.TaskRunner != nil {
		checks = append(checks, health.Config{
			Name:      "task_runner",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     gateways.TaskRunner.HealthCheck,
		})
	}

	// Add CMS worker service health check if configured
	if conf.Task.GCPProject != "" && conf.Task.WorkerURL != "" {
		checks = append(checks, health.Config{
			Name:      "worker_service",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check: httpCheck.New(httpCheck.Config{
				URL:            conf.Task.WorkerURL + "/health",
				RequestTimeout: time.Second * 5,
			}),
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
				Check: httpCheck.New(httpCheck.Config{
					URL:            u.JoinPath(".well-known/openid-configuration").String(),
					RequestTimeout: time.Second * 10,
				}),
			})
		}
	}

	h, err := health.New(
		health.WithComponent(health.Component{Name: "reearth-cms", Version: ver}),
		health.WithChecks(checks...),
		health.WithTracerProvider(otel.GetTracerProvider(), "reearth-cms"),
	)
	if err != nil {
		log.Fatalf("failed to create health check: %v", err)
	}

	return &HealthChecker{
		health: h,
		config: conf,
	}
}

func (hc *HealthChecker) Check(ctx context.Context) error {
	log.Infof("health check: running initial health checks...")
	result := hc.health.Measure(ctx)
	if len(result.Failures) > 0 {
		return fmt.Errorf("initial health check failed: %v", result.Failures)
	}
	log.Infof("health check: all checks passed")
	return nil
}
