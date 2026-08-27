package gcp

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/api/cloudbuild/v1"
	"google.golang.org/api/option"
)

func TestTaskRunner_HealthCheck_Cache(t *testing.T) {
	t.Parallel()

	// A TaskRunner with a nil pubsub client always fails a real check, so any
	// sentinel that comes back proves the cached value was served instead.
	sentinel := errors.New("cached result")

	tests := []struct {
		name       string
		hcResult   error
		hcResultAt time.Time
		wantCached bool
	}{
		{
			name:       "fresh cached error is served",
			hcResult:   sentinel,
			hcResultAt: time.Now(),
			wantCached: true,
		},
		{
			name:       "fresh cached success is served",
			hcResult:   nil,
			hcResultAt: time.Now(),
			wantCached: true,
		},
		{
			name:       "expired cache is recomputed",
			hcResult:   sentinel,
			hcResultAt: time.Now().Add(-2 * healthCheckCacheTTL),
			wantCached: false,
		},
		{
			name:       "zero timestamp is treated as expired",
			hcResult:   sentinel,
			hcResultAt: time.Time{},
			wantCached: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			tr := &TaskRunner{
				conf:       &TaskConfig{},
				hcResult:   tt.hcResult,
				hcResultAt: tt.hcResultAt,
			}

			err := tr.HealthCheck(context.Background())

			if tt.wantCached {
				assert.ErrorIs(t, err, tt.hcResult)
				return
			}
			assert.Error(t, err)
			assert.NotErrorIs(t, err, sentinel)
		})
	}
}

func TestTaskRunner_HealthCheck_StoresResult(t *testing.T) {
	t.Parallel()

	tr := &TaskRunner{conf: &TaskConfig{}}

	err := tr.HealthCheck(context.Background())
	assert.Error(t, err)

	assert.False(t, tr.hcResultAt.IsZero(), "result should be stamped for the next call")
	assert.Equal(t, err, tr.hcResult, "result should be cached for the next call")
}

func TestTaskRunner_doHealthCheck_NilPubsub(t *testing.T) {
	t.Parallel()

	tr := &TaskRunner{conf: &TaskConfig{}}

	assert.Error(t, tr.doHealthCheck(context.Background()))
}

func TestTaskRunner_decompressAsset_SuccessReturnsNil(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		region string
	}{
		{name: "global build", region: ""},
		{name: "regional build", region: "asia-northeast1"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				_, _ = w.Write([]byte(`{"name":"operations/build-1"}`))
			}))
			defer srv.Close()

			cb, err := cloudbuild.NewService(context.Background(),
				option.WithEndpoint(srv.URL),
				option.WithoutAuthentication(),
			)
			require.NoError(t, err)

			tr := &TaskRunner{
				conf: &TaskConfig{
					GCPProject:        "p",
					GCPRegion:         tt.region,
					GCSBucket:         "bucket",
					DecompressorImage: "img",
					DecompressorTopic: "decompress",
				},
				cbService: cb,
			}

			err = tr.decompressAsset(context.Background(), task.Payload{
				DecompressAsset: &task.DecompressAssetPayload{AssetID: "a", Path: "dir/file.zip"},
			})

			assert.NoError(t, err)
		})
	}
}
