package gcp

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/task"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"google.golang.org/api/cloudbuild/v1"
	"google.golang.org/api/option"
)

func TestTaskRunner_HealthCheck_NilPubsub(t *testing.T) {
	t.Parallel()

	tr := &TaskRunner{conf: &TaskConfig{}}

	assert.Error(t, tr.HealthCheck(context.Background()))
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
