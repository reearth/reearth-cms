package policy

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/stretchr/testify/assert"
)

func TestWebhookPolicyChecker_CheckPolicy(t *testing.T) {
	tests := []struct {
		name           string
		serverResponse *gateway.PolicyCheckResponse
		serverStatus   int
		serverToken    string
		clientToken    string
		wantErr        bool
	}{
		{
			name: "successful check - allowed",
			serverResponse: &gateway.PolicyCheckResponse{
				Allowed:      true,
				CheckType:    gateway.PolicyCheckCMSUploadAssetsSize,
				CurrentLimit: "10GB",
				Message:      "Upload allowed",
				Value:        1024,
			},
			serverStatus: http.StatusOK,
			serverToken:  "test-token",
			clientToken:  "test-token",
			wantErr:      false,
		},
		{
			name: "successful check - denied",
			serverResponse: &gateway.PolicyCheckResponse{
				Allowed:      false,
				CheckType:    gateway.PolicyCheckCMSUploadAssetsSize,
				CurrentLimit: "1GB",
				Message:      "Upload size exceeded",
				Value:        1024 * 1024 * 1024 * 2,
			},
			serverStatus: http.StatusOK,
			serverToken:  "test-token",
			clientToken:  "test-token",
			wantErr:      false,
		},
		{
			name:         "server error",
			serverStatus: http.StatusInternalServerError,
			serverToken:  "test-token",
			clientToken:  "test-token",
			wantErr:      true,
		},
		{
			name: "unauthorized - token mismatch",
			serverResponse: &gateway.PolicyCheckResponse{
				Allowed: false,
			},
			serverStatus: http.StatusUnauthorized,
			serverToken:  "correct-token",
			clientToken:  "wrong-token",
			wantErr:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create test server
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Check authorization
				if tt.serverToken != "" {
					auth := r.Header.Get("Authorization")
					if auth != "Bearer "+tt.serverToken {
						w.WriteHeader(http.StatusUnauthorized)
						return
					}
				}

				// Check method and content type
				assert.Equal(t, http.MethodPost, r.Method)
				assert.Equal(t, "application/json", r.Header.Get("Content-Type"))

				// Parse request
				var req gateway.PolicyCheckRequest
				err := json.NewDecoder(r.Body).Decode(&req)
				assert.NoError(t, err)

				// Send response
				w.WriteHeader(tt.serverStatus)
				if tt.serverResponse != nil {
					json.NewEncoder(w).Encode(tt.serverResponse)
				}
			}))
			defer server.Close()

			// Create checker
			checker := NewWebhookPolicyChecker(server.URL, tt.clientToken, 5)

			// Make request
			req := gateway.PolicyCheckRequest{
				WorkspaceID: "workspace01",
				CheckType:   gateway.PolicyCheckCMSUploadAssetsSize,
				Value:       1024,
			}

			resp, err := checker.CheckPolicy(context.Background(), req)

			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.serverResponse, resp)
			}
		})
	}
}

func TestWebhookPolicyChecker_Timeout(t *testing.T) {
	// Create slow server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Sleep longer than timeout
		<-r.Context().Done()
	}))
	defer server.Close()

	// Create checker with 1 second timeout
	checker := NewWebhookPolicyChecker(server.URL, "", 1)

	req := gateway.PolicyCheckRequest{
		WorkspaceID: "workspace01",
		CheckType:   gateway.PolicyCheckCMSUploadAssetsSize,
		Value:       1024,
	}

	_, err := checker.CheckPolicy(context.Background(), req)
	assert.Error(t, err)
}
