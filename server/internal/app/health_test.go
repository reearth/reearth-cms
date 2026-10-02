package app

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/hellofresh/health-go/v5"
	"github.com/labstack/echo/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestHealthChecker_Check(t *testing.T) {
	t.Parallel()

	ok := func(context.Context) error { return nil }
	fail := func(context.Context) error { return errors.New("down") }

	tests := []struct {
		name    string
		checks  []health.Config
		wantErr bool
	}{
		{
			name: "all checks pass",
			checks: []health.Config{
				{Name: "db", Timeout: time.Second, Check: ok},
				{Name: "worker_service", Timeout: time.Second, SkipOnErr: true, Check: ok},
			},
		},
		{
			name: "non-critical check fails",
			checks: []health.Config{
				{Name: "db", Timeout: time.Second, Check: ok},
				{Name: "worker_service", Timeout: time.Second, SkipOnErr: true, Check: fail},
			},
		},
		{
			name: "critical check fails",
			checks: []health.Config{
				{Name: "db", Timeout: time.Second, Check: fail},
				{Name: "worker_service", Timeout: time.Second, SkipOnErr: true, Check: ok},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			h, err := health.New(health.WithChecks(tt.checks...))
			require.NoError(t, err)

			hc := &HealthChecker{health: h}
			err = hc.Check(context.Background())
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestWorkerHealthCheck_FailureIsNonCritical(t *testing.T) {
	t.Parallel()

	worker := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	t.Cleanup(worker.Close)

	h, err := health.New(health.WithChecks(
		health.Config{Name: "db", Timeout: time.Second, Check: func(context.Context) error { return nil }},
		workerHealthCheck(worker.URL),
	))
	require.NoError(t, err)
	hc := &HealthChecker{health: h, config: &Config{}}

	// startup check must not fail
	assert.NoError(t, hc.Check(context.Background()))

	// /health must stay 200 and report the worker failure
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	require.NoError(t, hc.Handler()(echo.NewContext(req, rec)))

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Contains(t, rec.Body.String(), string(health.StatusPartiallyAvailable))
	assert.Contains(t, rec.Body.String(), "worker_service")
}

func TestWorkerHealthURL(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		base string
		want string
	}{
		{
			name: "host and port",
			base: "http://worker:8080",
			want: "http://worker:8080/health",
		},
		{
			name: "trailing slash is not doubled",
			base: "http://worker:8080/",
			want: "http://worker:8080/health",
		},
		{
			name: "base path is preserved",
			base: "http://worker:8080/cms",
			want: "http://worker:8080/cms/health",
		},
		{
			name: "base path with trailing slash",
			base: "http://worker:8080/cms/",
			want: "http://worker:8080/cms/health",
		},
		{
			name: "https host",
			base: "https://worker.example.com",
			want: "https://worker.example.com/health",
		},
		{
			// url.Parse rejects these, so the TrimRight fallback builds the URL.
			name: "unparsable base uses fallback",
			base: "://bad",
			want: "://bad/health",
		},
		{
			name: "unparsable base with trailing slash is not doubled",
			base: "http://[::1:80/",
			want: "http://[::1:80/health",
		},
		{
			// A scheme-less base parses as an opaque URL, so no path can be
			// appended and the probe silently targets the base itself.
			name: "scheme-less base gets no health path",
			base: "worker:8080",
			want: "worker:8080",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			assert.Equal(t, tt.want, workerHealthURL(tt.base))
		})
	}
}
