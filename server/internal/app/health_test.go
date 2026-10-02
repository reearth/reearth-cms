package app

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/hellofresh/health-go/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCheckResult(t *testing.T) {
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

			err = checkResult(h.Measure(context.Background()))
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
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
