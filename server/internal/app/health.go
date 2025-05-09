package app

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"cloud.google.com/go/storage"
	"github.com/hellofresh/health-go/v5"
	"github.com/hellofresh/health-go/v5/checks/mongo"
	"github.com/labstack/echo/v4"
)

// HealthCheck returns an echo.HandlerFunc that serves the health check endpoint
func HealthCheck(conf *Config) echo.HandlerFunc {
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

	if conf.GCS.BucketName != "" {
		checks = append(checks, health.Config{
			Name:      "gcs",
			Timeout:   time.Second * 5,
			SkipOnErr: false,
			Check:     func(ctx context.Context) error { return gcsCheck(ctx, conf.GCS.BucketName) },
		})
	}

	for _, a := range conf.Auths() {
		if a.ISS != "" {
			checks = append(checks, health.Config{
				Name:      "auth:" + a.ISS,
				Timeout:   time.Second * 5,
				SkipOnErr: false,
				Check:     func(ctx context.Context) error { return authServerPingCheck(a.ISS) },
			})
		}
	}

	h, _ := health.New(health.WithComponent(health.Component{
		Name:    "reearth-cms",
		Version: "1.0.0",
	}), health.WithChecks(checks...))

	return echo.WrapHandler(h.Handler())
}

func gcsCheck(ctx context.Context, bucketName string) (checkErr error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("GCS client creation failed: %v", err)
	}
	defer func(client *storage.Client) {
		err := client.Close()
		if err != nil {
			checkErr = fmt.Errorf("GCS client close failed: %v", err)
		}
	}(client)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	_, err = client.Bucket(bucketName).Attrs(ctx)
	if err != nil {
		return fmt.Errorf("GCS bucket access failed: %v", err)
	}
	return nil
}

func authServerPingCheck(issuerURL string) error {
	client := http.Client{
		Timeout: 2 * time.Second,
	}
	u, err := url.Parse(issuerURL)
	if err != nil {
		return fmt.Errorf("invalid issuer URL: %v", err)
	}
	resp, err := client.Get(u.JoinPath(".well-known/openid-configuration").String())
	if err != nil {
		return fmt.Errorf("auth server unreachable: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	return fmt.Errorf("auth server unhealthy, status: %d", resp.StatusCode)
}
