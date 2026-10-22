package file

import (
	"context"
	"io"
	"mime"
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"strings"
	"testing"

	"github.com/jarcoal/httpmock"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
)

func TestFromURL(t *testing.T) {
	ctx := context.Background()

	// Activate httpmock on the custom urlFetchClient (not the default transport)
	// so that the existing mock responders intercept requests going through our client.
	httpmock.ActivateNonDefault(urlFetchClient)
	defer httpmock.DeactivateAndReset()

	t.Run("with gzip encoding", func(t *testing.T) {
		URL := "https://cms.com/xyz/test.txt.gz"
		f := lo.Must(os.Open("testdata/test.txt"))
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {
				t.Fatalf("failed to close file: %v", err)
			}
		}(f)
		z := lo.Must(io.ReadAll(f))

		httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
			res := httpmock.NewBytesResponse(200, z)
			res.Header.Set("Content-Type", mime.TypeByExtension(path.Ext(URL)))
			res.Header.Set("Content-Length", "123")
			res.Header.Set("Content-Encoding", "gzip")
			return res, nil
		})

		got, err := FromURL(ctx, URL)
		assert.NoError(t, err)
		assert.Equal(t, "gzip", got.ContentEncoding)
	})

	t.Run("normal", func(t *testing.T) {
		URL := "https://cms.com/xyz/test.txt"
		f := lo.Must(os.Open("testdata/test.txt"))
		defer func(f *os.File) {
			err := f.Close()
			if err != nil {
				t.Fatalf("failed to close file: %v", err)
			}
		}(f)
		z := lo.Must(io.ReadAll(f))

		httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
			res := httpmock.NewBytesResponse(200, z)
			res.Header.Set("Content-Type", mime.TypeByExtension(path.Ext(URL)))
			res.Header.Set("Content-Length", "123")
			res.Header.Set("Content-Disposition", `attachment; filename="filename.txt"`)
			return res, nil
		})

		expected := File{Name: "filename.txt", Content: f, Size: 123}

		got, err := FromURL(ctx, URL)
		assert.NoError(t, err)
		assert.Equal(t, expected.Name, got.Name)
		assert.Equal(t, z, lo.Must(io.ReadAll(got.Content)))

		httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
			res := httpmock.NewBytesResponse(200, z)
			res.Header.Set("Content-Type", mime.TypeByExtension(path.Ext(URL)))
			return res, nil
		})

		expected = File{Name: "test.txt", Content: f, Size: 0}

		got, err = FromURL(ctx, URL)
		assert.NoError(t, err)
		assert.Equal(t, expected.Name, got.Name)
		assert.Equal(t, z, lo.Must(io.ReadAll(got.Content)))
	})

	t.Run("rejects non-http scheme", func(t *testing.T) {
		_, err := FromURL(ctx, "file:///etc/passwd")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "unsupported URL scheme")
	})

	t.Run("rejects ftp scheme", func(t *testing.T) {
		_, err := FromURL(ctx, "ftp://example.com/file.txt")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "unsupported URL scheme")
	})
}

// TestFromURL_SSRFLoopbackBlocked verifies that requests to loopback addresses
// are rejected even when an HTTP server is actually listening there. This test
// operates outside the httpmock scope so that the real DialContext is invoked.
func TestFromURL_SSRFLoopbackBlocked(t *testing.T) {
	ctx := context.Background()

	// Start a real local server; its address will be 127.0.0.1:<port>.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	// srv.URL is "http://127.0.0.1:<port>" — a loopback address.
	// The SSRF dial error is wrapped by rerror.ErrInternalBy, so we check that
	// an error is returned (the connection was blocked) rather than matching text.
	_, err := FromURL(ctx, srv.URL)
	assert.Error(t, err, "expected SSRF block for loopback address")
}

type closeTrackingBody struct {
	io.Reader
	closed bool
}

func (b *closeTrackingBody) Close() error {
	b.closed = true
	return nil
}

func TestFromURL_Error(t *testing.T) {
	ctx := context.Background()

	httpmock.Activate()
	defer httpmock.Deactivate()

	tests := []struct {
		name            string
		status          int
		contentEncoding string
	}{
		{name: "300 multiple choices", status: http.StatusMultipleChoices},
		{name: "404 not found", status: http.StatusNotFound},
		{name: "unsupported content encoding", status: http.StatusOK, contentEncoding: "br"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			URL := "https://cms.com/xyz/error.txt"
			body := &closeTrackingBody{Reader: strings.NewReader("body")}
			httpmock.RegisterResponder("GET", URL, func(r *http.Request) (*http.Response, error) {
				res := httpmock.NewStringResponse(tt.status, "")
				res.Body = body
				if tt.contentEncoding != "" {
					res.Header.Set("Content-Encoding", tt.contentEncoding)
				}
				return res, nil
			})

			got, err := FromURL(ctx, URL)
			assert.Error(t, err)
			assert.Nil(t, got)
			assert.True(t, body.closed, "response body should be closed")
		})
	}
}
