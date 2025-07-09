package dashboard

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testBaseURL     = "https://api.dashboard.example.com"
	testWorkspaceID = "01jyg9hfsatv599emg1knc0rgb"
	testToken       = "test-bearer-token"
)

// MockAuthenticator is a mock implementation of the Authenticator interface for testing
type MockAuthenticator struct {
	token string
	err   error
}

func (m *MockAuthenticator) GetToken() (string, error) {
	return m.token, m.err
}

// Helper function to create a test client with mock auth
func newTestClient() *Client {
	auth := &MockAuthenticator{token: testToken}
	return NewClient(testBaseURL, auth)
}

func TestNewClient(t *testing.T) {
	auth := &MockAuthenticator{token: testToken}
	client := NewClient(testBaseURL, auth)

	assert.NotNil(t, client)
	assert.Equal(t, testBaseURL, client.baseURL)
	assert.Equal(t, auth, client.authenticator)
	assert.NotNil(t, client.httpClient)
	assert.Equal(t, 30*time.Second, client.httpClient.Timeout)
}

func TestCheckPlanConstraints_Success(t *testing.T) {
	tests := []struct {
		name         string
		checkType    CheckType
		value        int64
		expectedResp CheckPlanConstraintsResponse
		expectedURL  string
	}{
		{
			name:      "CMS private data transfer upload size allowed",
			checkType: CheckTypeCMSPrivateDataTransferUploadSize,
			value:     1024,
			expectedResp: CheckPlanConstraintsResponse{
				Allowed:      true,
				CheckType:    CheckTypeCMSPrivateDataTransferUploadSize,
				CurrentLimit: "10GB",
				Message:      "Within limits",
				Value:        1024,
			},
			expectedURL: fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, testWorkspaceID),
		},
		{
			name:      "CMS model count per project not allowed",
			checkType: CheckTypeCMSModelCountPerProject,
			value:     100,
			expectedResp: CheckPlanConstraintsResponse{
				Allowed:      false,
				CheckType:    CheckTypeCMSModelCountPerProject,
				CurrentLimit: "50",
				Message:      "Exceeded model count limit",
				Value:        100,
			},
			expectedURL: fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, testWorkspaceID),
		},
		{
			name:      "General public project creation",
			checkType: CheckTypeGeneralPublicProjectCreation,
			value:     1,
			expectedResp: CheckPlanConstraintsResponse{
				Allowed:      true,
				CheckType:    CheckTypeGeneralPublicProjectCreation,
				CurrentLimit: "unlimited",
				Message:      "Public project creation allowed",
				Value:        1,
			},
			expectedURL: fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, testWorkspaceID),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			client := newTestClient()
			client.httpClient = createMockHTTPClient(t, tt.expectedURL, tt.checkType, tt.value, tt.expectedResp)

			req := CheckPlanConstraintsRequest{
				CheckType: tt.checkType,
				Value:     tt.value,
			}

			resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

			require.NoError(t, err)
			assert.Equal(t, tt.expectedResp, *resp)
		})
	}
}

func TestCheckPlanConstraints_AllCheckTypes(t *testing.T) {
	checkTypes := []CheckType{
		CheckTypeCMSPrivateDataTransferUploadSize,
		CheckTypeCMSPrivateDataTransferDownloadSize,
		CheckTypeCMSPublicDataTransferUploadSize,
		CheckTypeCMSPublicDataTransferDownloadSize,
		CheckTypeCMSUploadAssetsSizeFromUI,
		CheckTypeCMSModelCountPerProject,
		CheckTypeGeneralPrivateProjectCreation,
		CheckTypeGeneralPublicProjectCreation,
	}

	for _, checkType := range checkTypes {
		t.Run(string(checkType), func(t *testing.T) {
			t.Parallel()
			expectedResp := CheckPlanConstraintsResponse{
				Allowed:      true,
				CheckType:    checkType,
				CurrentLimit: "1000",
				Message:      "OK",
				Value:        500,
			}

			client := newTestClient()
			client.httpClient = createMockHTTPClient(t, fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, testWorkspaceID), checkType, 500, expectedResp)

			req := CheckPlanConstraintsRequest{
				CheckType: checkType,
				Value:     500,
			}

			resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

			require.NoError(t, err)
			assert.Equal(t, expectedResp, *resp)
		})
	}
}

func TestCheckPlanConstraints_HTTPErrors(t *testing.T) {
	tests := []struct {
		name           string
		httpStatusCode int
		expectedError  string
	}{
		{
			name:           "Bad Request",
			httpStatusCode: http.StatusBadRequest,
			expectedError:  "API request failed with status 400",
		},
		{
			name:           "Not Found",
			httpStatusCode: http.StatusNotFound,
			expectedError:  "API request failed with status 404",
		},
		{
			name:           "Internal Server Error",
			httpStatusCode: http.StatusInternalServerError,
			expectedError:  "API request failed with status 500",
		},
		{
			name:           "Unauthorized",
			httpStatusCode: http.StatusUnauthorized,
			expectedError:  "API request failed with status 401",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			client := newTestClient()
			client.httpClient = &http.Client{
				Transport: RoundTripFunc(func(req *http.Request) *http.Response {
					return &http.Response{
						StatusCode: tt.httpStatusCode,
						Body:       io.NopCloser(strings.NewReader(`{"error": "test error"}`)),
						Header:     make(http.Header),
					}
				}),
			}

			req := CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     1024,
			}

			resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

			assert.Nil(t, resp)
			assert.Error(t, err)
			assert.Contains(t, err.Error(), tt.expectedError)
		})
	}
}

func TestCheckPlanConstraints_InvalidJSON(t *testing.T) {
	client := newTestClient()
	client.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`invalid json`)),
				Header:     make(http.Header),
			}
		}),
	}

	req := CheckPlanConstraintsRequest{
		CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
		Value:     1024,
	}

	resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

	assert.Nil(t, resp)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "error decoding response")
}

type contextKey string

func TestCheckPlanConstraints_ContextHandling(t *testing.T) {
	client := newTestClient()
	client.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			// Verify that the context is properly passed to the request
			assert.NotNil(t, req.Context())
			assert.NotEqual(t, context.Background(), req.Context())

			return &http.Response{
				StatusCode: http.StatusOK,
				Body: io.NopCloser(strings.NewReader(`{
					"allowed": true,
					"check_type": "cms_private_data_transfer_upload_size",
					"current_limit": "10GB",
					"message": "OK",
					"value": 1024
				}`)),
				Header: make(http.Header),
			}
		}),
	}

	ctx := context.WithValue(context.Background(), contextKey("test-key"), "test-value")

	req := CheckPlanConstraintsRequest{
		CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
		Value:     1024,
	}

	resp, err := client.CheckPlanConstraints(ctx, testWorkspaceID, req)

	assert.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Allowed)
}

func TestCheckPlanConstraints_RequestValidation(t *testing.T) {
	client := newTestClient()
	client.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			// Verify request method
			assert.Equal(t, http.MethodPost, req.Method)

			// Verify content type
			assert.Equal(t, "application/json", req.Header.Get("Content-Type"))

			// Verify URL
			expectedURL := fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, testWorkspaceID)
			assert.Equal(t, expectedURL, req.URL.String())

			// Verify request body
			var body CheckPlanConstraintsRequest
			err := json.NewDecoder(req.Body).Decode(&body)
			assert.NoError(t, err)
			assert.Equal(t, CheckTypeCMSPrivateDataTransferUploadSize, body.CheckType)
			assert.Equal(t, int64(1024), body.Value)

			return &http.Response{
				StatusCode: http.StatusOK,
				Body: io.NopCloser(strings.NewReader(`{
					"allowed": true,
					"check_type": "cms_private_data_transfer_upload_size",
					"current_limit": "10GB",
					"message": "Within limits",
					"value": 1024
				}`)),
				Header: make(http.Header),
			}
		}),
	}

	req := CheckPlanConstraintsRequest{
		CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
		Value:     1024,
	}

	resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

	require.NoError(t, err)
	assert.NotNil(t, resp)
	assert.True(t, resp.Allowed)
}

func TestCheckPlanConstraints_NetworkError(t *testing.T) {
	auth := &MockAuthenticator{token: testToken}
	client := NewClient("http://invalid-url-that-does-not-exist.com", auth)

	req := CheckPlanConstraintsRequest{
		CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
		Value:     1024,
	}

	resp, err := client.CheckPlanConstraints(context.Background(), testWorkspaceID, req)

	assert.Nil(t, resp)
	assert.Error(t, err)
	// Could be either a network error or HTTP status error depending on DNS resolution
	assert.True(t, 
		strings.Contains(err.Error(), "error making API request") || 
		strings.Contains(err.Error(), "API request failed with status"), 
		"Expected network or HTTP error, got: %v", err.Error())
}

func TestCheckPlanConstraints_URLEncoding(t *testing.T) {
	tests := []struct {
		name              string
		workspaceID       string
		expectedEncodedID string
	}{
		{
			name:              "Normal workspace ID",
			workspaceID:       "01jyg9hfsatv599emg1knc0rgb",
			expectedEncodedID: "01jyg9hfsatv599emg1knc0rgb",
		},
		{
			name:              "Workspace ID with spaces",
			workspaceID:       "workspace with spaces",
			expectedEncodedID: "workspace%20with%20spaces",
		},
		{
			name:              "Workspace ID with special characters",
			workspaceID:       "workspace/with&special=chars?and#hash",
			expectedEncodedID: "workspace%2Fwith&special=chars%3Fand%23hash",
		},
		{
			name:              "Workspace ID with plus sign",
			workspaceID:       "workspace+with+plus",
			expectedEncodedID: "workspace+with+plus",
		},
		{
			name:              "Workspace ID with percent encoding",
			workspaceID:       "workspace%already%encoded",
			expectedEncodedID: "workspace%25already%25encoded",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client := newTestClient()
			client.httpClient = &http.Client{
				Transport: RoundTripFunc(func(req *http.Request) *http.Response {
					// Verify that the URL string contains the properly encoded workspace ID
					expectedURL := fmt.Sprintf("%s/api/workspaces/%s/check-plan-constraints", testBaseURL, tt.expectedEncodedID)
					assert.Equal(t, expectedURL, req.URL.String())

					return &http.Response{
						StatusCode: http.StatusOK,
						Body: io.NopCloser(strings.NewReader(`{
							"allowed": true,
							"check_type": "cms_private_data_transfer_upload_size",
							"current_limit": "10GB",
							"message": "OK",
							"value": 1024
						}`)),
						Header: make(http.Header),
					}
				}),
			}

			req := CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     1024,
			}

			resp, err := client.CheckPlanConstraints(context.Background(), tt.workspaceID, req)

			assert.NoError(t, err)
			assert.NotNil(t, resp)
			assert.True(t, resp.Allowed)
		})
	}
}

func TestCheckPlanConstraints_EdgeCases(t *testing.T) {
	tests := []struct {
		name        string
		workspaceID string
		request     CheckPlanConstraintsRequest
		wantErr     bool
	}{
		{
			name:        "Empty workspace ID",
			workspaceID: "",
			request: CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     1024,
			},
			wantErr: false, // The client should still make the request
		},
		{
			name:        "Zero value",
			workspaceID: testWorkspaceID,
			request: CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     0,
			},
			wantErr: false,
		},
		{
			name:        "Negative value",
			workspaceID: testWorkspaceID,
			request: CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     -1,
			},
			wantErr: false,
		},
		{
			name:        "Large value",
			workspaceID: testWorkspaceID,
			request: CheckPlanConstraintsRequest{
				CheckType: CheckTypeCMSPrivateDataTransferUploadSize,
				Value:     9223372036854775807, // max int64
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			expectedResp := CheckPlanConstraintsResponse{
				Allowed:      true,
				CheckType:    tt.request.CheckType,
				CurrentLimit: "unlimited",
				Message:      "OK",
				Value:        tt.request.Value,
			}

			client := newTestClient()
			client.httpClient = createMockHTTPClient(t, fmt.Sprintf("%s"+CheckConstraintsPath, testBaseURL, tt.workspaceID), tt.request.CheckType, tt.request.Value, expectedResp)

			resp, err := client.CheckPlanConstraints(context.Background(), tt.workspaceID, tt.request)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, resp)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, resp)
				assert.Equal(t, expectedResp, *resp)
			}
		})
	}
}

// Helper functions

func createMockHTTPClient(t *testing.T, expectedURL string, expectedCheckType CheckType, expectedValue int64, response CheckPlanConstraintsResponse) *http.Client {
	t.Helper()

	return &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			assert.Equal(t, http.MethodPost, req.Method)
			assert.Equal(t, expectedURL, req.URL.String())
			assert.Equal(t, "application/json", req.Header.Get("Content-Type"))

			var body CheckPlanConstraintsRequest
			err := json.NewDecoder(req.Body).Decode(&body)
			assert.NoError(t, err)
			assert.Equal(t, expectedCheckType, body.CheckType)
			assert.Equal(t, expectedValue, body.Value)

			respBody, err := json.Marshal(response)
			assert.NoError(t, err)

			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewReader(respBody)),
				Header:     make(http.Header),
			}
		}),
	}
}

type RoundTripFunc func(req *http.Request) *http.Response

func (f RoundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req), nil
}
