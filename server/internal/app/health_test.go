package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

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
