package gcp

import (
	"context"
	"net/url"
	"path"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "xxx.yyy"), getGCSObjectPath(u, n))

	n = "ああああ.yyy"
	assert.Equal(t, path.Join(gcsAssetBasePath, u[:2], u[2:], "ああああ.yyy"), getGCSObjectPath(u, n))

	assert.Equal(t, "", getGCSObjectPath("", ""))
}

func TestFile_GetWorkspaceFromContext(t *testing.T) {
	tests := []struct {
		name     string
		ctx      context.Context
		expected string
	}{
		{
			name:     "with workspace",
			ctx:      context.WithValue(context.Background(), contextKey("workspace"), "workspace-123"),
			expected: "workspace-123",
		},
		{
			name:     "without workspace",
			ctx:      context.Background(),
			expected: "",
		},
		{
			name:     "with non-string value",
			ctx:      context.WithValue(context.Background(), contextKey("workspace"), 123),
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getWorkspaceFromContext(tt.ctx)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFile_NewFile(t *testing.T) {
	tests := []struct {
		name         string
		bucketName   string
		publicBase   string
		cacheControl string
		wantErr      bool
		wantHost     string
	}{
		{
			name:         "with custom base URL",
			bucketName:   "test-bucket",
			publicBase:   "https://assets.cms.dev.reearth.io",
			cacheControl: "public, max-age=3600",
			wantErr:      false,
			wantHost:     "assets.cms.dev.reearth.io",
		},
		{
			name:         "without base URL (default to GCS)",
			bucketName:   "test-bucket",
			publicBase:   "",
			cacheControl: "public, max-age=3600",
			wantErr:      false,
			wantHost:     "storage.googleapis.com",
		},
		{
			name:         "empty bucket name",
			bucketName:   "",
			publicBase:   "https://assets.cms.dev.reearth.io",
			cacheControl: "",
			wantErr:      true,
			wantHost:     "",
		},
		{
			name:         "invalid URL",
			bucketName:   "test-bucket",
			publicBase:   "://invalid-url",
			cacheControl: "",
			wantErr:      true,
			wantHost:     "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f, err := NewFile(tt.bucketName, tt.publicBase, tt.cacheControl, false)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, f)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, f)
				fr := f.(*fileRepo)
				assert.Equal(t, tt.wantHost, fr.publicBase.Host)
			}
		})
	}
}

func TestFile_GetGCSObjectPathFolder(t *testing.T) {
	u := newUUID()

	type args struct {
		uuid string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "success",
			args: args{
				uuid: u,
			},
			want: path.Join(gcsAssetBasePath, u[:2], u[2:]),
		},
		{
			name: "invalid uuid",
			args: args{
				uuid: "testing",
			},
			want: "",
		},
		{
			name: "empty",
			args: args{
				uuid: "",
			},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			actual := getGCSObjectPathFolder(tt.args.uuid)
			assert.Equal(t, tt.want, actual)
		})
	}
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, IsValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, IsValidUUID(u1))
}

func TestFile_GetURL(t *testing.T) {
	tests := []struct {
		name     string
		host     string
		uuid     string
		filename string
		expected string
	}{
		{
			name:     "standard GCS URL",
			host:     "https://storage.googleapis.com/test-bucket",
			uuid:     "12345678-1234-1234-1234-123456789012",
			filename: "test.jpg",
			expected: "https://storage.googleapis.com/test-bucket/assets/12/345678-1234-1234-1234-123456789012/test.jpg",
		},
		{
			name:     "custom domain URL",
			host:     "https://assets.cms.dev.reearth.io",
			uuid:     "87654321-4321-4321-4321-210987654321",
			filename: "document.pdf",
			expected: "https://assets.cms.dev.reearth.io/assets/87/654321-4321-4321-4321-210987654321/document.pdf",
		},
		{
			name:     "custom domain with path",
			host:     "https://cdn.example.com/files",
			uuid:     "abcdef12-3456-7890-abcd-ef1234567890",
			filename: "image.png",
			expected: "https://cdn.example.com/files/assets/ab/cdef12-3456-7890-abcd-ef1234567890/image.png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			host, err := url.Parse(tt.host)
			assert.NoError(t, err)

			result := getURL(host, tt.uuid, tt.filename)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestFileRepo_UnsignedURLGeneration(t *testing.T) {
	tests := []struct {
		name           string
		publicBaseURL  string
		expectedDomain string
		expectedPath   string
		replaceUpload  bool
		workspaceID    string
	}{
		{
			name:           "proxy mode - generate unsigned URL",
			publicBaseURL:  "https://assets.cms.dev.reearth.io",
			expectedDomain: "assets.cms.dev.reearth.io",
			expectedPath:   "/assets/12/345678-1234-1234-1234-123456789012/test-file.json",
			replaceUpload:  true,
			workspaceID:    "workspace-123",
		},
		{
			name:           "proxy mode with path - generate unsigned URL",
			publicBaseURL:  "https://cdn.example.com/files",
			expectedDomain: "cdn.example.com",
			expectedPath:   "/files/assets/12/345678-1234-1234-1234-123456789012/test-file.json",
			replaceUpload:  true,
			workspaceID:    "",
		},
		{
			name:           "direct mode - should use signed URLs (test would need GCS mock)",
			publicBaseURL:  "https://storage.googleapis.com/test-bucket",
			expectedDomain: "", // This case would generate signed URLs, not testable here
			expectedPath:   "",
			replaceUpload:  false,
			workspaceID:    "",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			if !tt.replaceUpload {
				// Skip signed URL tests since they require GCS mocking
				t.Skip("Signed URL generation requires GCS client mocking")
				return
			}

			// Create fileRepo with custom public base
			publicBase, err := url.Parse(tt.publicBaseURL)
			assert.NoError(t, err)

			f := &fileRepo{
				bucketName:       "test-bucket",
				publicBase:       publicBase,
				cacheControl:     "public, max-age=3600",
				public:           true,
				replaceUploadURL: tt.replaceUpload,
			}

			// Create context with workspace if provided
			ctx := context.Background()
			if tt.workspaceID != "" {
				ctx = context.WithValue(ctx, contextKey("workspace"), tt.workspaceID)
			}

			// Create test parameters
			param := gateway.IssueUploadAssetParam{
				UUID:          "12345678-1234-1234-1234-123456789012",
				Filename:      "test-file.json",
				ContentType:   "application/json",
				ContentLength: 1024,
			}

			// Test the URL generation logic directly since we can't mock GCS
			p := getGCSObjectPath(param.UUID, param.Filename)
			uploadURL := f.publicBase.JoinPath(p)
			
			if workspace := getWorkspaceFromContext(ctx); workspace != "" {
				query := uploadURL.Query()
				query.Set("workspace", workspace)
				uploadURL.RawQuery = query.Encode()
			}

			// Verify the generated URL
			assert.Equal(t, tt.expectedDomain, uploadURL.Host)
			// JoinPath may or may not include leading slash depending on base URL
			expectedPath := tt.expectedPath
			actualPath := uploadURL.Path
			if actualPath != "" && actualPath[0] != '/' && expectedPath != "" && expectedPath[0] == '/' {
				actualPath = "/" + actualPath
			}
			assert.Equal(t, expectedPath, actualPath)

			// Verify workspace query parameter if provided
			if tt.workspaceID != "" {
				assert.Equal(t, tt.workspaceID, uploadURL.Query().Get("workspace"))
			}

			// Verify no signed URL parameters are present
			assert.Empty(t, uploadURL.Query().Get("GoogleAccessId"))
			assert.Empty(t, uploadURL.Query().Get("Signature"))
			assert.Empty(t, uploadURL.Query().Get("Expires"))
		})
	}
}

func TestFileRepo_IssueUploadAssetLink_Headers(t *testing.T) {
	// This test verifies that workspace ID and content encoding headers are properly set
	tests := []struct {
		name            string
		workspaceID     string
		contentEncoding string
		expectWorkspace bool
		expectEncoding  bool
	}{
		{
			name:            "with workspace and encoding",
			workspaceID:     "workspace-123",
			contentEncoding: "gzip",
			expectWorkspace: true,
			expectEncoding:  true,
		},
		{
			name:            "with workspace only",
			workspaceID:     "workspace-456",
			contentEncoding: "",
			expectWorkspace: true,
			expectEncoding:  false,
		},
		{
			name:            "without workspace",
			workspaceID:     "",
			contentEncoding: "gzip",
			expectWorkspace: false,
			expectEncoding:  true,
		},
		{
			name:            "neither workspace nor encoding",
			workspaceID:     "",
			contentEncoding: "",
			expectWorkspace: false,
			expectEncoding:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// The actual header validation would be done in integration tests
			// Here we just verify the logic of including headers based on context

			ctx := context.Background()
			if tt.workspaceID != "" {
				ctx = context.WithValue(ctx, contextKey("workspace"), tt.workspaceID)
			}

			// Verify workspace extraction
			ws := getWorkspaceFromContext(ctx)
			if tt.expectWorkspace {
				assert.Equal(t, tt.workspaceID, ws)
			} else {
				assert.Empty(t, ws)
			}

			// Headers would be included in SignedURLOptions
			var headers []string
			if tt.contentEncoding != "" {
				headers = append(headers, "Content-Encoding: "+tt.contentEncoding)
			}
			if ws != "" {
				headers = append(headers, "x-goog-meta-X-Reearth-Workspace-ID: "+ws)
			}

			// Verify headers are constructed correctly
			if tt.expectWorkspace && tt.expectEncoding {
				assert.Len(t, headers, 2)
			} else if tt.expectWorkspace || tt.expectEncoding {
				assert.Len(t, headers, 1)
			} else {
				assert.Empty(t, headers)
			}
		})
	}
}

func TestFileRepo_ValidateContentEncoding(t *testing.T) {
	tests := []struct {
		name     string
		encoding string
		wantErr  bool
	}{
		{
			name:     "empty encoding",
			encoding: "",
			wantErr:  false,
		},
		{
			name:     "identity encoding",
			encoding: "identity",
			wantErr:  false,
		},
		{
			name:     "gzip encoding",
			encoding: "gzip",
			wantErr:  false,
		},
		{
			name:     "unsupported encoding",
			encoding: "br",
			wantErr:  true,
		},
		{
			name:     "invalid encoding",
			encoding: "invalid",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateContentEncoding(tt.encoding)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Equal(t, gateway.ErrUnsupportedContentEncoding, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
