//go:build serve_live

package serve

// Live tests against a running reearth-serve. They are excluded from normal
// builds; run them with:
//
//	SERVE_LIVE_ENDPOINT=http://localhost:5173 \
//	SERVE_LIVE_PROJECT_ID=<project id> \
//	SERVE_LIVE_TOKEN_FILE=<file holding a user JWT> \
//	go test -tags serve_live -run TestLive -v ./internal/infrastructure/serve/

import (
	"bytes"
	"compress/gzip"
	"context"
	"errors"
	"io"
	"net/http"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newLiveFile(t *testing.T) gateway.File {
	t.Helper()
	endpoint, projectID, tokenFile := os.Getenv("SERVE_LIVE_ENDPOINT"), os.Getenv("SERVE_LIVE_PROJECT_ID"), os.Getenv("SERVE_LIVE_TOKEN_FILE")
	if endpoint == "" || projectID == "" || tokenFile == "" {
		t.Skip("SERVE_LIVE_ENDPOINT, SERVE_LIVE_PROJECT_ID and SERVE_LIVE_TOKEN_FILE are required")
	}
	b, err := os.ReadFile(tokenFile)
	require.NoError(t, err)
	token := strings.TrimPrefix(strings.TrimSpace(string(b)), "Bearer ")

	f, err := NewFile(Config{
		Endpoint:  endpoint,
		ProjectID: projectID,
		Transport: NewTokenTransport(nil, func(context.Context) string { return token }),
	})
	require.NoError(t, err)
	return f
}

// readAll reads an asset file and undoes a stored gzip encoding.
func readAll(t *testing.T, f gateway.File, key, name string) []byte {
	t.Helper()
	r, headers, err := f.ReadAsset(context.Background(), key, name, nil)
	require.NoError(t, err)
	defer func() { _ = r.Close() }()
	if headers["Content-Encoding"] == "gzip" {
		gr, err := gzip.NewReader(r)
		require.NoError(t, err)
		r = gr
	}
	b, err := io.ReadAll(r)
	require.NoError(t, err)
	return b
}

func TestLive_Check(t *testing.T) {
	f := newLiveFile(t)
	require.NoError(t, f.Check(context.Background()))
}

func TestLive_DirectUpload(t *testing.T) {
	f := newLiveFile(t)
	ctx := context.Background()
	content := []byte("hello from cms " + time.Now().Format(time.RFC3339Nano))

	key, size, err := f.UploadAsset(ctx, &file.File{
		Content: io.NopCloser(bytes.NewReader(content)),
		Name:    "direct.txt",
		Size:    int64(len(content)),
	})
	require.NoError(t, err)
	t.Logf("asset id: %s, size: %d", key, size)
	assert.Equal(t, int64(len(content)), size)
	t.Cleanup(func() { assert.NoError(t, f.DeleteAsset(context.Background(), key, "direct.txt")) })

	files, err := f.GetAssetFiles(ctx, key)
	require.NoError(t, err)
	t.Logf("files: %+v", files)
	assert.Equal(t, content, readAll(t, f, key, "direct.txt"))
}

func TestLive_UploadLink(t *testing.T) {
	tests := []struct {
		name    string
		file    string
		content []byte
	}{
		{name: "small binary", file: "small.bin", content: []byte{0, 1, 2, 3, 4, 5}},
		// Larger than reearth-serve's 1 KB threshold, so it asks for gzip.
		{name: "compressible json", file: "data.json", content: []byte(`{"items":[` + strings.Repeat(`{"name":"item","value":42},`, 200) + `{}]}`)},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := newLiveFile(t)
			ctx := context.Background()

			link, err := f.IssueUploadAssetLink(ctx, gateway.IssueUploadAssetParam{
				UUID:          "cms-generated-uuid",
				Filename:      tt.file,
				ContentLength: int64(len(tt.content)),
				ExpiresAt:     time.Now().Add(time.Hour),
			})
			if errors.Is(err, gateway.ErrUnsupportedOperation) {
				t.Skip("this reearth-serve has no presigned uploads (local dev); CMS falls back to direct upload")
			}
			require.NoError(t, err)
			t.Logf("upload id: %s, content-type: %q, content-encoding: %q, expires: %s", link.UUID, link.ContentType, link.ContentEncoding, link.ExpiresAt)
			require.NotEmpty(t, link.UUID)
			assert.NotEqual(t, "cms-generated-uuid", link.UUID)

			// Do what the CMS web client does.
			body := tt.content
			if link.ContentEncoding == "gzip" {
				var buf bytes.Buffer
				zw := gzip.NewWriter(&buf)
				_, _ = zw.Write(tt.content)
				require.NoError(t, zw.Close())
				body = buf.Bytes()
			}
			req, err := http.NewRequestWithContext(ctx, http.MethodPut, link.URL, bytes.NewReader(body))
			require.NoError(t, err)
			if link.ContentType != "" {
				req.Header.Set("Content-Type", link.ContentType)
			}
			if link.ContentEncoding != "" {
				req.Header.Set("Content-Encoding", link.ContentEncoding)
			}
			res, err := http.DefaultClient.Do(req)
			require.NoError(t, err)
			resBody, _ := io.ReadAll(res.Body)
			_ = res.Body.Close()
			require.Less(t, res.StatusCode, 300, "PUT %s: %s", res.Status, resBody)

			u := asset.NewUpload().UUID(link.UUID).FileName(tt.file).ContentLength(int64(len(tt.content))).Serve(true).Build()
			got, key, err := f.UploadedAsset(ctx, u)
			require.NoError(t, err)
			t.Logf("asset id: %s, file: %+v", key, *got)
			t.Cleanup(func() { assert.NoError(t, f.DeleteAsset(context.Background(), key, tt.file)) })
			assert.Equal(t, int64(len(tt.content)), got.Size)

			assert.Equal(t, tt.content, readAll(t, f, key, tt.file))
		})
	}
}
