package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestFile(t *testing.T, h http.Handler) *fileRepo {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	f, err := NewFile(Config{
		Endpoint:  srv.URL,
		ProjectID: "prj",
		Transport: NewTokenTransport(nil, func(context.Context) string { return "token" }),
	})
	require.NoError(t, err)
	return f.(*fileRepo)
}

func requireAuth(t *testing.T, r *http.Request) {
	t.Helper()
	assert.Equal(t, "Bearer token", r.Header.Get("Authorization"))
}

func TestNewFile(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		conf    Config
		wantErr string
	}{
		{name: "valid", conf: Config{Endpoint: "http://serve", Transport: http.DefaultTransport}},
		{name: "nil transport", conf: Config{Endpoint: "http://serve"}},
		{name: "no endpoint", conf: Config{}, wantErr: "endpoint is required"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f, err := NewFile(tt.conf)
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				assert.Nil(t, f)
				return
			}
			assert.NoError(t, err)
			assert.NotNil(t, f)
		})
	}
}

func TestFile_Check(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  int
		wantErr bool
	}{
		{name: "ok", status: http.StatusOK},
		{name: "unavailable", status: http.StatusServiceUnavailable, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, "/api/v1/health", r.URL.Path)
				w.WriteHeader(tt.status)
				_, _ = w.Write([]byte(`{"error":"unavailable"}`))
			}))
			err := f.Check(context.Background())
			if tt.wantErr {
				assert.ErrorContains(t, errors.Unwrap(err), "unavailable")
				return
			}
			assert.NoError(t, err)
		})
	}
}

func TestFile_ReadAsset(t *testing.T) {
	t.Parallel()

	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.EscapedPath() {
		case "/files/a1/dir/tileset%20v2.json":
			assert.Equal(t, "bytes=0-3", r.Header.Get("Range"))
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Content-Range", "bytes 0-3/10")
			w.WriteHeader(http.StatusPartialContent)
			_, _ = w.Write([]byte(`{"a"`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	ctx := context.Background()

	r, h, err := f.ReadAsset(ctx, "a1", "dir/tileset v2.json", map[string]string{"Range": "bytes=0-3"})
	require.NoError(t, err)
	b, _ := io.ReadAll(r)
	_ = r.Close()
	assert.Equal(t, `{"a"`, string(b))
	assert.Equal(t, "application/json", h["Content-Type"])
	assert.Equal(t, "bytes 0-3/10", h["Content-Range"])

	_, _, err = f.ReadAsset(ctx, "a1", "missing.json", nil)
	assert.ErrorIs(t, err, rerror.ErrNotFound)

	_, _, err = f.ReadAsset(ctx, "", "x", nil)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}

func TestFile_GetAssetFiles(t *testing.T) {
	t.Parallel()

	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requireAuth(t, r)
		if r.URL.Path != "/api/v1/assets/a1/files" {
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{"error":"Asset not found"}`))
			return
		}
		w.Header().Set("Content-Type", "application/x-ndjson")
		_, _ = w.Write([]byte(
			`{"path":"tileset.json","size":10,"contentType":"application/json"}` + "\n" +
				`{"path":"data/0.b3dm","size":20,"contentType":"application/octet-stream","contentEncoding":"gzip"}` + "\n",
		))
	}))
	ctx := context.Background()

	got, err := f.GetAssetFiles(ctx, "a1")
	require.NoError(t, err)
	assert.Equal(t, []gateway.FileEntry{
		{Name: "tileset.json", Size: 10, ContentType: "application/json"},
		{Name: "data/0.b3dm", Size: 20, ContentType: "application/octet-stream", ContentEncoding: "gzip"},
	}, got)

	_, err = f.GetAssetFiles(ctx, "missing")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
}

func TestFile_UploadAsset(t *testing.T) {
	t.Parallel()

	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requireAuth(t, r)
		assert.Equal(t, http.MethodPost, r.Method)
		assert.Equal(t, "/api/v1/assets", r.URL.Path)
		assert.Equal(t, "hello.txt", r.Header.Get("X-Filename"))
		assert.Equal(t, "prj", r.Header.Get("X-Project-Id"))
		assert.Equal(t, int64(5), r.ContentLength)
		b, _ := io.ReadAll(r.Body)
		assert.Equal(t, "hello", string(b))
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{"asset": map[string]any{"id": "serve-1", "size": 5}})
	}))
	ctx := context.Background()

	id, size, err := f.UploadAsset(ctx, &file.File{
		Content: io.NopCloser(strings.NewReader("hello")),
		Name:    "hello.txt",
		Size:    5,
	})
	require.NoError(t, err)
	assert.Equal(t, "serve-1", id)
	assert.Equal(t, int64(5), size)
}

func TestFile_UploadAsset_OriginalSize(t *testing.T) {
	t.Parallel()

	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, _ = io.Copy(io.Discard, r.Body)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		// reearth-serve stored the file gzipped: size is the stored size.
		_, _ = w.Write([]byte(`{"asset":{"id":"serve-1","size":2,"originalSize":5}}`))
	}))

	_, size, err := f.UploadAsset(context.Background(), &file.File{
		Content: io.NopCloser(strings.NewReader("hello")),
		Name:    "hello.json",
		Size:    5,
	})
	require.NoError(t, err)
	assert.Equal(t, int64(5), size)
}

func TestFile_UploadAsset_SkipExtraction(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		skip bool
		want string
	}{
		{name: "extract", skip: false, want: ""},
		{name: "skip", skip: true, want: "true"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				assert.Equal(t, tt.want, r.Header.Get("X-Skip-Extraction"))
				_, _ = io.Copy(io.Discard, r.Body)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusCreated)
				_, _ = w.Write([]byte(`{"asset":{"id":"serve-1","size":5}}`))
			}))

			_, _, err := f.UploadAsset(context.Background(), &file.File{
				Content:        io.NopCloser(strings.NewReader("hello")),
				Name:           "a.zip",
				Size:           5,
				SkipExtraction: tt.skip,
			})
			require.NoError(t, err)
		})
	}
}

func TestFile_UploadAsset_Invalid(t *testing.T) {
	t.Parallel()

	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Errorf("unexpected request: %s", r.URL)
	}))
	ctx := context.Background()
	content := func() io.ReadCloser { return io.NopCloser(strings.NewReader("x")) }

	tests := []struct {
		name string
		file *file.File
		want error
	}{
		{name: "nil", file: nil, want: gateway.ErrInvalidFile},
		{name: "no name", file: &file.File{Content: content(), Size: 1}, want: gateway.ErrInvalidFile},
		{name: "unknown size", file: &file.File{Content: content(), Name: "a"}, want: gateway.ErrInvalidFile},
		{name: "unsupported encoding", file: &file.File{Content: content(), Name: "a", Size: 1, ContentEncoding: "br"}, want: gateway.ErrUnsupportedContentEncoding},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			_, _, err := f.UploadAsset(ctx, tt.file)
			assert.ErrorIs(t, err, tt.want)
		})
	}
}

func TestFile_DeleteAsset(t *testing.T) {
	t.Parallel()

	var deleted []string
	f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requireAuth(t, r)
		assert.Equal(t, http.MethodDelete, r.Method)
		id := strings.TrimPrefix(r.URL.Path, "/api/v1/assets/")
		switch id {
		case "fail":
			w.WriteHeader(http.StatusInternalServerError)
		case "gone":
			w.WriteHeader(http.StatusNotFound)
		default:
			deleted = append(deleted, id)
			w.WriteHeader(http.StatusNoContent)
		}
	}))
	ctx := context.Background()

	assert.NoError(t, f.DeleteAsset(ctx, "a1", "ignored.txt"))
	assert.NoError(t, f.DeleteAsset(ctx, "gone", ""), "missing asset counts as deleted")
	assert.ErrorIs(t, f.DeleteAsset(ctx, "", ""), gateway.ErrInvalidFile)

	err := f.DeleteAssets(ctx, []string{"a2", "fail", "a3"})
	assert.ErrorContains(t, err, "fail")
	assert.Equal(t, []string{"a1", "a2", "a3"}, deleted, "a failure must not stop the remaining deletions")
}

func TestFile_AccessInfo(t *testing.T) {
	t.Parallel()

	f, err := NewFile(Config{Endpoint: "https://serve.reearth.land/"})
	require.NoError(t, err)

	a := asset.New().NewID().Project(asset.NewProjectID()).CreatedByUser(asset.NewUserID()).
		Size(1).ServeID(lo.ToPtr("serve-1")).FileName("dir/a b.json").MustBuild()
	legacy := asset.New().NewID().Project(asset.NewProjectID()).CreatedByUser(asset.NewUserID()).
		Size(1).NewUUID().FileName("a.json").MustBuild()

	assert.Equal(t, &asset.AccessInfo{Url: "https://serve.reearth.land/files/serve-1/dir/a%20b.json", Public: true}, f.GetAccessInfo(a))
	assert.Equal(t, f.GetAccessInfo(a), f.GetAccessInfoResolver()(a))
	assert.Nil(t, f.GetAccessInfo(nil))
	assert.Nil(t, f.GetAccessInfo(legacy), "assets not bound to serve have no serve url")
	assert.Equal(t, "https://serve.reearth.land/files", f.GetBaseURL())
}

func TestFile_Unsupported(t *testing.T) {
	t.Parallel()

	f, err := NewFile(Config{Endpoint: "http://serve"})
	require.NoError(t, err)
	ctx := context.Background()

	assert.ErrorIs(t, f.UnpublishAsset(ctx, "a", "b"), gateway.ErrUnsupportedOperation)
	assert.NoError(t, f.PublishAsset(ctx, "a", "b"))
	_, _, err = f.Read(ctx, "x", nil)
	assert.ErrorIs(t, err, gateway.ErrUnsupportedOperation)
	_, err = f.Upload(ctx, &file.File{}, "x")
	assert.ErrorIs(t, err, gateway.ErrUnsupportedOperation)
	assert.ErrorIs(t, f.Delete(ctx, "x"), gateway.ErrUnsupportedOperation)
	assert.ErrorIs(t, f.DeleteByPrefix(ctx, "x", nil), gateway.ErrUnsupportedOperation)
	_, err = f.ListByPrefix(ctx, "x")
	assert.ErrorIs(t, err, gateway.ErrUnsupportedOperation)
}

func TestFile_IssueUploadAssetLink(t *testing.T) {
	t.Parallel()

	expiresAt := time.Date(2030, 1, 1, 0, 0, 0, 0, time.UTC)
	session := func(headers string) string {
		return `{"uploadId":"up-1","url":"https://r2/put","method":"PUT","headers":` + headers + `,"expiresAt":` + strconv.FormatInt(expiresAt.UnixMilli(), 10) + `}`
	}

	tests := []struct {
		name         string
		param        gateway.IssueUploadAssetParam
		status       int
		body         string
		wantErr      error
		wantErrMsg   string
		wantLink     *gateway.UploadAssetLink
		wantNoServer bool
	}{
		{
			name:   "plain upload",
			param:  gateway.IssueUploadAssetParam{UUID: "cms-uuid", Filename: "a.bin", ContentLength: 10, ContentType: "application/octet-stream"},
			status: http.StatusCreated,
			body:   session(`{"Content-Type":"application/octet-stream"}`),
			wantLink: &gateway.UploadAssetLink{
				URL: "https://r2/put", ContentType: "application/octet-stream", ContentLength: 10, UUID: "up-1", ExpiresAt: expiresAt,
			},
		},
		{
			name:   "serve asks for gzip",
			param:  gateway.IssueUploadAssetParam{Filename: "a.json", ContentLength: 2048},
			status: http.StatusCreated,
			body:   session(`{"content-type":"application/json","Content-Encoding":"gzip"}`),
			wantLink: &gateway.UploadAssetLink{
				URL: "https://r2/put", ContentType: "application/json", ContentLength: 2048, ContentEncoding: "gzip", UUID: "up-1", ExpiresAt: expiresAt,
			},
		},
		{
			name:       "header the web client cannot send",
			param:      gateway.IssueUploadAssetParam{Filename: "a.bin", ContentLength: 10},
			status:     http.StatusCreated,
			body:       session(`{"Content-Type":"application/octet-stream","X-Amz-Meta":"x"}`),
			wantErrMsg: "unsupported upload header",
		},
		{
			name:    "presigned uploads unavailable",
			param:   gateway.IssueUploadAssetParam{Filename: "a.bin", ContentLength: 10},
			status:  http.StatusNotImplemented,
			body:    `{"error":"Presigned URL uploads not available."}`,
			wantErr: gateway.ErrUnsupportedOperation,
		},
		{
			name:       "upload rejected",
			param:      gateway.IssueUploadAssetParam{Filename: "a.bin", ContentLength: 10},
			status:     http.StatusUnauthorized,
			body:       `{"error":"Anonymous upload is disabled"}`,
			wantErrMsg: "Anonymous upload is disabled",
		},
		{name: "no filename", param: gateway.IssueUploadAssetParam{ContentLength: 10}, wantErr: gateway.ErrInvalidFile, wantNoServer: true},
		{name: "no size", param: gateway.IssueUploadAssetParam{Filename: "a.bin"}, wantErr: gateway.ErrInvalidFile, wantNoServer: true},
		{name: "cursor", param: gateway.IssueUploadAssetParam{Filename: "a.bin", ContentLength: 10, Cursor: "c"}, wantErr: gateway.ErrInvalidFile, wantNoServer: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if tt.wantNoServer {
					t.Error("unexpected request")
				}
				requireAuth(t, r)
				assert.Equal(t, http.MethodPost, r.Method)
				assert.Equal(t, "/api/v1/assets/uploads", r.URL.Path)
				assert.Equal(t, "prj", r.Header.Get("X-Project-Id"))
				var body CreateUploadSessionRequest
				assert.NoError(t, json.NewDecoder(r.Body).Decode(&body))
				assert.Equal(t, tt.param.Filename, body.Filename)
				assert.Equal(t, float64(tt.param.ContentLength), body.Size)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(tt.status)
				_, _ = w.Write([]byte(tt.body))
			}))

			got, err := f.IssueUploadAssetLink(context.Background(), tt.param)
			switch {
			case tt.wantErr != nil:
				assert.ErrorIs(t, err, tt.wantErr)
			case tt.wantErrMsg != "":
				require.Error(t, err)
				assert.Contains(t, err.Error()+" "+fmt.Sprint(errors.Unwrap(err)), tt.wantErrMsg)
			default:
				require.NoError(t, err)
				assert.Equal(t, tt.wantLink, got)
			}
		})
	}
}

func TestFile_UploadedAsset(t *testing.T) {
	t.Parallel()

	u := asset.NewUpload().UUID("up-1").FileName("a.json").Serve(true).Build()

	tests := []struct {
		name     string
		status   int
		body     string
		wantErr  error
		wantFile *file.File
		wantKey  string
	}{
		{
			name:     "completed",
			status:   http.StatusCreated,
			body:     `{"asset":{"id":"serve-1","size":5,"contentType":"application/json"},"url":"https://serve/files/serve-1/a.json"}`,
			wantFile: &file.File{Name: "a.json", Size: 5, ContentType: "application/json"},
			wantKey:  "serve-1",
		},
		{
			name:     "gzipped by serve reports the original size",
			status:   http.StatusCreated,
			body:     `{"asset":{"id":"serve-1","size":2,"originalSize":5,"contentType":"application/json","contentEncoding":"gzip"},"url":"u"}`,
			wantFile: &file.File{Name: "a.json", Size: 5, ContentType: "application/json"},
			wantKey:  "serve-1",
		},
		{
			name:    "not uploaded yet",
			status:  http.StatusNotFound,
			body:    `{"error":"Upload session not found or file not yet uploaded"}`,
			wantErr: rerror.ErrNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				requireAuth(t, r)
				assert.Equal(t, http.MethodPost, r.Method)
				assert.Equal(t, "/api/v1/assets/uploads/up-1/complete", r.URL.Path)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(tt.status)
				_, _ = w.Write([]byte(tt.body))
			}))

			got, key, err := f.UploadedAsset(context.Background(), u)
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, tt.wantFile, got)
			assert.Equal(t, tt.wantKey, key)
		})
	}

	t.Run("no upload", func(t *testing.T) {
		t.Parallel()
		f := newTestFile(t, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			t.Error("unexpected request")
		}))
		_, _, err := f.UploadedAsset(context.Background(), nil)
		assert.ErrorIs(t, err, gateway.ErrInvalidFile)
	})
}
