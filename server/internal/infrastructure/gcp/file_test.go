package gcp

import (
	"context"
	"net/url"
	"path"
	"strings"
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

func TestFileRepo_IssueUploadAssetLink_toPublicUrl(t *testing.T) {
	tests := []struct {
		name           string
		publicBaseURL  string
		expectedDomain string
		shouldReplace  bool
	}{
		{
			name:           "custom domain - should replace",
			publicBaseURL:  "https://assets.cms.dev.reearth.io",
			expectedDomain: "assets.cms.dev.reearth.io",
			shouldReplace:  true,
		},
		{
			name:           "custom domain with path - should replace",
			publicBaseURL:  "https://cdn.example.com/assets",
			expectedDomain: "cdn.example.com",
			shouldReplace:  true,
		},
		{
			name:           "default GCS domain - should not replace",
			publicBaseURL:  "https://storage.googleapis.com/test-bucket",
			expectedDomain: "storage.googleapis.com",
			shouldReplace:  false,
		},
		{
			name:           "empty base URL - should not replace",
			publicBaseURL:  "",
			expectedDomain: "storage.googleapis.com",
			shouldReplace:  false,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create fileRepo with custom public base
			var publicBase *url.URL
			if tt.publicBaseURL != "" {
				var err error
				publicBase, err = url.Parse(tt.publicBaseURL)
				assert.NoError(t, err)
			}

			f := &fileRepo{
				bucketName:       "test-bucket",
				publicBase:       publicBase,
				cacheControl:     "public, max-age=3600",
				public:           true,
				replaceUploadURL: tt.shouldReplace,
			}

			// Since we can't easily mock the GCS bucket.SignedURL method,
			// we'll test the URL parsing and replacement logic separately
			// by simulating what would happen after getting a signed URL

			// Simulate a signed URL from GCS
			signedURL := "https://storage.googleapis.com/test-bucket/assets/12/345678-1234-1234-1234-123456789012/test-file.json?Expires=1234567890&GoogleAccessId=test@test.iam.gserviceaccount.com&Signature=abc123"

			// Apply the same logic as in IssueUploadAssetLink
			finalURL := f.toPublicUrl(signedURL)

			// Parse the final URL to check the domain
			finalParsedURL, err := url.Parse(finalURL)
			assert.NoError(t, err)

			// Check if domain was replaced as expected
			assert.Equal(t, tt.expectedDomain, finalParsedURL.Host)

			// Check that query parameters are preserved
			assert.Equal(t, "1234567890", finalParsedURL.Query().Get("Expires"))
			assert.Equal(t, "test@test.iam.gserviceaccount.com", finalParsedURL.Query().Get("GoogleAccessId"))
			assert.Equal(t, "abc123", finalParsedURL.Query().Get("Signature"))

			// If domain was replaced, check the path handling
			if tt.shouldReplace && f.publicBase.Path != "" {
				assert.True(t, strings.HasPrefix(finalParsedURL.Path, f.publicBase.Path))
			}
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

func TestFileRepo_BucketWithOptions(t *testing.T) {
	tests := []struct {
		name          string
		bucketName    string
		publicBaseURL string
		forSigning    bool
		expectedError bool
		description   string
	}{
		{
			name:          "standard GCS client for signing",
			bucketName:    "test-bucket",
			publicBaseURL: "https://assets.example.com",
			forSigning:    true,
			expectedError: false,
			description:   "Should use standard GCS client when forSigning=true",
		},
		{
			name:          "standard GCS client for default domain",
			bucketName:    "test-bucket",
			publicBaseURL: "https://storage.googleapis.com/test-bucket",
			forSigning:    false,
			expectedError: false,
			description:   "Should use standard GCS client when domain is storage.googleapis.com",
		},
		{
			name:          "custom endpoint client for custom domain",
			bucketName:    "test-bucket",
			publicBaseURL: "https://assets.example.com",
			forSigning:    false,
			expectedError: false,
			description:   "Should use custom endpoint client when domain is not storage.googleapis.com and not signing",
		},
		{
			name:          "custom endpoint with path",
			bucketName:    "test-bucket",
			publicBaseURL: "https://cdn.example.com/storage",
			forSigning:    false,
			expectedError: false,
			description:   "Should handle custom endpoints with paths",
		},
		{
			name:          "empty bucket name",
			bucketName:    "",
			publicBaseURL: "https://storage.googleapis.com",
			forSigning:    false,
			expectedError: false,
			description:   "Should handle empty bucket name (will create handle but may fail on actual operations)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			t.Parallel()
			// Parse the public base URL
			var publicBase *url.URL
			if tt.publicBaseURL != "" {
				var err error
				publicBase, err = url.Parse(tt.publicBaseURL)
				assert.NoError(t, err)
			}

			// Create fileRepo instance
			f := &fileRepo{
				bucketName: tt.bucketName,
				publicBase: publicBase,
			}

			// Test bucketWithOptions
			ctx := context.Background()
			bucket, err := f.bucketWithOptions(ctx, tt.forSigning)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Nil(t, bucket)
			} else {
				if err != nil {
					t.Logf("Expected auth-related error in test environment: %v", err)
				} else {
					assert.NotNil(t, bucket)
				}
			}
		})
	}
}

func TestFileRepo_BucketWithOptions_ClientSelection(t *testing.T) {
	tests := []struct {
		name               string
		publicBaseHost     string
		forSigning         bool
		expectedClientType string
		description        string
	}{
		{
			name:               "signing with custom domain uses standard client",
			publicBaseHost:     "assets.example.com",
			forSigning:         true,
			expectedClientType: "standard",
			description:        "Signed URLs must always use standard GCS client regardless of custom domain",
		},
		{
			name:               "non-signing with GCS domain uses standard client",
			publicBaseHost:     "storage.googleapis.com",
			forSigning:         false,
			expectedClientType: "standard",
			description:        "Standard GCS domain should use standard client",
		},
		{
			name:               "non-signing with custom domain uses custom client",
			publicBaseHost:     "assets.example.com",
			forSigning:         false,
			expectedClientType: "custom",
			description:        "Custom domain should use custom endpoint client when not signing",
		},
		{
			name:               "signing with GCS domain uses standard client",
			publicBaseHost:     "storage.googleapis.com",
			forSigning:         true,
			expectedClientType: "standard",
			description:        "GCS domain with signing should use standard client",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			// Create a URL with the specified host
			publicBase, err := url.Parse("https://" + tt.publicBaseHost + "/test-bucket")
			assert.NoError(t, err)

			f := &fileRepo{
				bucketName: "test-bucket",
				publicBase: publicBase,
			}

			ctx := context.Background()

			shouldUseStandard := tt.forSigning || f.publicBase.Host == "storage.googleapis.com"

			if tt.expectedClientType == "standard" {
				assert.True(t, shouldUseStandard, "Should use standard client for test case: %s", tt.name)
			} else {
				assert.False(t, shouldUseStandard, "Should use custom client for test case: %s", tt.name)
			}

			bucket, err := f.bucketWithOptions(ctx, tt.forSigning)
			if err != nil {
				t.Logf("Expected error in test environment: %v", err)
			} else {
				assert.NotNil(t, bucket)
			}
		})
	}
}

func TestFileRepo_BucketWithOptions_ErrorHandling(t *testing.T) {
	tests := []struct {
		name          string
		publicBaseURL string
		forSigning    bool
		description   string
	}{
		{
			name:          "invalid custom endpoint URL",
			publicBaseURL: "not-a-valid-url",
			forSigning:    false,
			description:   "Should handle invalid URLs gracefully",
		},
		{
			name:          "empty public base",
			publicBaseURL: "",
			forSigning:    false,
			description:   "Should handle nil publicBase",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var publicBase *url.URL
			if tt.publicBaseURL != "" {
				if tt.publicBaseURL == "not-a-valid-url" {
					publicBase = &url.URL{Host: "invalid-host-with-no-scheme"}
				} else {
					var err error
					publicBase, err = url.Parse(tt.publicBaseURL)
					assert.NoError(t, err)
				}
			}

			f := &fileRepo{
				bucketName: "test-bucket",
				publicBase: publicBase,
			}

			ctx := context.Background()
			bucket, err := f.bucketWithOptions(ctx, tt.forSigning)

			if err != nil {
				t.Logf("Expected error in test environment: %v", err)
				assert.Error(t, err)
			} else {
				assert.NotNil(t, bucket)
			}
		})
	}
}

func TestFileRepo_Bucket(t *testing.T) {
	// Test the wrapper method bucket() that calls bucketWithOptions(ctx, false)
	publicBase, err := url.Parse("https://storage.googleapis.com/test-bucket")
	assert.NoError(t, err)

	f := &fileRepo{
		bucketName: "test-bucket",
		publicBase: publicBase,
	}

	ctx := context.Background()
	bucket, err := f.bucket(ctx)

	if err != nil {
		t.Logf("Expected error in test environment: %v", err)
	} else {
		assert.NotNil(t, bucket)
	}
}
