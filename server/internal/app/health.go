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
			Check: func(ctx context.Context) error {
				return gateways.TaskRunner.HealthCheck(ctx)
			},
		})
	}

	// Add CMS worker service health check if configured
	if conf.Task.GCPProject != "" {
		checks = append(checks, health.Config{
			Name:      "worker_service",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check: func(ctx context.Context) error {

				workerURL := conf.Task.WorkerURL

				client := http.Client{
					Timeout: 2 * time.Second,
				}
				resp, err := client.Get(workerURL + "/health")
				if err != nil {
					return fmt.Errorf("worker service unreachable: %v", err)
				}
				defer func() {
					if cerr := resp.Body.Close(); cerr != nil {
						err = fmt.Errorf("failed to close response body: %v", cerr)
					}
				}()

				if resp.StatusCode < 200 || resp.StatusCode >= 300 {
					return fmt.Errorf("worker service unhealthy, status: %d", resp.StatusCode)
				}
				return nil
			},
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

// PerformStartupHealthChecks performs health checks during server startup.
// If any of the checks fail, the server will not start.
func PerformStartupHealthChecks(ctx context.Context, conf *Config, gateways *gateway.Container) error {
	log.Info("performing startup health checks...")

	// Check MongoDB connectivity
	if err := checkMongoDB(ctx, conf.DB); err != nil {
		return fmt.Errorf("MongoDB health check failed: %v", err)
	}
	log.Info("MongoDB health check passed")

	// Check GCS bucket if configured
	if conf.GCS.BucketName != "" {
		if err := gcsCheck(ctx, conf.GCS.BucketName); err != nil {
			return fmt.Errorf("GCS bucket health check failed: %v", err)
		}
		log.Info("GCS bucket health check passed")
	}

	// Check task runner if configured
	if gateways != nil && gateways.TaskRunner != nil {
		if err := gateways.TaskRunner.HealthCheck(ctx); err != nil {
			return fmt.Errorf("task runner health check failed: %v", err)
		}
		log.Info("task runner health check passed")
	}

	log.Info("all startup health checks passed")
	return nil
}

func checkMongoDB(ctx context.Context, dbURI string) error {
	check := mongo.New(mongo.Config{DSN: dbURI})
	return check(ctx)
}
