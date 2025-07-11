package dashboard

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testClientID     = "test-client-id"
	testClientSecret = "test-client-secret"
	testAudience     = "https://api.dashboard.example.com"
	testTokenURL     = "https://auth.example.com/oauth/token"
	testAccessToken  = "test-access-token"
)

func TestNewTokenProvider(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	assert.NotNil(t, provider)
	assert.Equal(t, testClientID, provider.clientID)
	assert.Equal(t, testClientSecret, provider.clientSecret)
	assert.Equal(t, testAudience, provider.audience)
	assert.Equal(t, testTokenURL, provider.tokenURL)
	assert.NotNil(t, provider.httpClient)
	assert.Equal(t, 30*time.Second, provider.httpClient.Timeout)
}

func TestTokenProvider_GetToken_Success(t *testing.T) {
	tests := []struct {
		name        string
		expiresIn   int64
		expectedExp time.Duration
		accessToken string
		tokenType   string
	}{
		{
			name:        "Valid token with 1 hour expiry",
			expiresIn:   3600,
			expectedExp: 3540 * time.Second, // 1 hour minus 60 seconds
			accessToken: "valid-access-token",
			tokenType:   "Bearer",
		},
		{
			name:        "Valid token with 24 hour expiry",
			expiresIn:   86400,
			expectedExp: 86340 * time.Second, // 24 hours minus 60 seconds
			accessToken: "long-lived-token",
			tokenType:   "Bearer",
		},
		{
			name:        "Valid token with minimum expiry",
			expiresIn:   300,
			expectedExp: 240 * time.Second, // 5 minutes minus 60 seconds
			accessToken: "short-lived-token",
			tokenType:   "Bearer",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

			// Mock HTTP client
			provider.httpClient = &http.Client{
				Transport: createTokenMockTransport(t, tt.accessToken, tt.tokenType, tt.expiresIn),
			}

			startTime := time.Now()
			token, err := provider.GetToken()

			require.NoError(t, err)
			assert.Equal(t, tt.accessToken, token)

			// Check that token is cached
			assert.Equal(t, tt.accessToken, provider.token)

			// Check expiration time (with some tolerance for test execution time)
			expectedExpiry := startTime.Add(tt.expectedExp)
			assert.WithinDuration(t, expectedExpiry, provider.expireAt, 5*time.Second)
		})
	}
}

func TestTokenProvider_GetToken_CacheHit(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	// Set up a cached token that hasn't expired
	provider.token = testAccessToken
	provider.expireAt = time.Now().Add(1 * time.Hour)

	// Mock HTTP client that should NOT be called
	callCount := 0
	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			callCount++
			t.Error("HTTP client should not be called when token is cached")
			return nil
		}),
	}

	token, err := provider.GetToken()

	require.NoError(t, err)
	assert.Equal(t, testAccessToken, token)
	assert.Equal(t, 0, callCount, "HTTP client should not have been called")
}

func TestTokenProvider_GetToken_CacheExpired(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	// Set up an expired cached token
	provider.token = "expired-token"
	provider.expireAt = time.Now().Add(-1 * time.Hour)

	// Mock HTTP client for refresh
	provider.httpClient = &http.Client{
		Transport: createTokenMockTransport(t, "new-access-token", "Bearer", 3600),
	}

	token, err := provider.GetToken()

	require.NoError(t, err)
	assert.Equal(t, "new-access-token", token)
	assert.Equal(t, "new-access-token", provider.token)
}

func TestTokenProvider_GetToken_HTTPErrors(t *testing.T) {
	tests := []struct {
		name           string
		httpStatusCode int
		responseBody   string
		expectedError  string
	}{
		{
			name:           "401 Unauthorized",
			httpStatusCode: http.StatusUnauthorized,
			responseBody:   `{"error": "invalid_client", "error_description": "Invalid client credentials"}`,
			expectedError:  "failed to auth status 401",
		},
		{
			name:           "400 Bad Request",
			httpStatusCode: http.StatusBadRequest,
			responseBody:   `{"error": "invalid_request", "error_description": "Missing required parameter"}`,
			expectedError:  "failed to auth status 400",
		},
		{
			name:           "500 Internal Server Error",
			httpStatusCode: http.StatusInternalServerError,
			responseBody:   `{"error": "server_error", "error_description": "Internal server error"}`,
			expectedError:  "failed to auth status 500",
		},
		{
			name:           "403 Forbidden",
			httpStatusCode: http.StatusForbidden,
			responseBody:   `{"error": "access_denied", "error_description": "Access denied"}`,
			expectedError:  "failed to auth status 403",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

			provider.httpClient = &http.Client{
				Transport: RoundTripFunc(func(req *http.Request) *http.Response {
					return &http.Response{
						StatusCode: tt.httpStatusCode,
						Body:       io.NopCloser(strings.NewReader(tt.responseBody)),
						Header:     make(http.Header),
					}
				}),
			}

			token, err := provider.GetToken()

			assert.Empty(t, token)
			assert.Error(t, err)
			assert.Contains(t, err.Error(), tt.expectedError)
			assert.Contains(t, err.Error(), tt.responseBody)
		})
	}
}

func TestTokenProvider_GetToken_NetworkError(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, "http://invalid-url-that-does-not-exist.com/oauth/token")

	token, err := provider.GetToken()

	assert.Empty(t, token)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to auth status")
}

func TestTokenProvider_GetToken_InvalidJSON(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`invalid json response`)),
				Header:     make(http.Header),
			}
		}),
	}

	token, err := provider.GetToken()

	assert.Empty(t, token)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "failed to decode auth response")
}

func TestTokenProvider_GetToken_EmptyAccessToken(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			response := map[string]interface{}{
				"access_token": "",
				"token_type":   "Bearer",
				"expires_in":   3600,
			}
			body, _ := json.Marshal(response)

			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(string(body))),
				Header:     make(http.Header),
			}
		}),
	}

	token, err := provider.GetToken()

	assert.Empty(t, token)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "empty access token received")
}

func TestTokenProvider_GetToken_RequestValidation(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			// Verify request method
			assert.Equal(t, http.MethodPost, req.Method)

			// Verify content type
			assert.Equal(t, "application/json", req.Header.Get("Content-Type"))

			// Verify URL
			assert.Equal(t, testTokenURL, req.URL.String())

			// Verify request body
			var body map[string]string
			err := json.NewDecoder(req.Body).Decode(&body)
			assert.NoError(t, err)
			assert.Equal(t, testClientID, body["client_id"])
			assert.Equal(t, testClientSecret, body["client_secret"])
			assert.Equal(t, testAudience, body["audience"])
			assert.Equal(t, "client_credentials", body["grant_type"])

			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"access_token": "test-token", "token_type": "Bearer", "expires_in": 3600}`)),
				Header:     make(http.Header),
			}
		}),
	}

	token, err := provider.GetToken()

	assert.NoError(t, err)
	assert.Equal(t, "test-token", token)
}

func TestTokenProvider_GetToken_ConcurrentAccess(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	callCount := 0
	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			callCount++
			// Simulate slow token server
			time.Sleep(100 * time.Millisecond)

			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"access_token": "concurrent-token", "token_type": "Bearer", "expires_in": 3600}`)),
				Header:     make(http.Header),
			}
		}),
	}

	// Make concurrent requests
	const numGoroutines = 10
	var wg sync.WaitGroup
	tokens := make([]string, numGoroutines)
	errors := make([]error, numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			token, err := provider.GetToken()
			tokens[index] = token
			errors[index] = err
		}(i)
	}

	wg.Wait()

	// All requests should succeed
	for i := 0; i < numGoroutines; i++ {
		assert.NoError(t, errors[i])
		assert.Equal(t, "concurrent-token", tokens[i])
	}

	// HTTP client should only be called once due to double-check locking
	assert.Equal(t, 1, callCount)
}

func TestTokenProvider_GetToken_DoubleCheckLocking(t *testing.T) {
	provider := NewTokenProvider(testClientID, testClientSecret, testAudience, testTokenURL)

	callCount := 0
	provider.httpClient = &http.Client{
		Transport: RoundTripFunc(func(req *http.Request) *http.Response {
			callCount++
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"access_token": "double-check-token", "token_type": "Bearer", "expires_in": 3600}`)),
				Header:     make(http.Header),
			}
		}),
	}

	// First call should fetch token
	token1, err1 := provider.GetToken()
	assert.NoError(t, err1)
	assert.Equal(t, "double-check-token", token1)
	assert.Equal(t, 1, callCount)

	// Second call should use cached token
	token2, err2 := provider.GetToken()
	assert.NoError(t, err2)
	assert.Equal(t, "double-check-token", token2)
	assert.Equal(t, 1, callCount) // Should not increment

	// Expire the token
	provider.expireAt = time.Now().Add(-1 * time.Hour)

	// Third call should refresh token
	token3, err3 := provider.GetToken()
	assert.NoError(t, err3)
	assert.Equal(t, "double-check-token", token3)
	assert.Equal(t, 2, callCount) // Should increment
}

// Helper functions

func createTokenMockTransport(t *testing.T, accessToken, tokenType string, expiresIn int64) http.RoundTripper {
	return RoundTripFunc(func(req *http.Request) *http.Response {
		response := map[string]interface{}{
			"access_token": accessToken,
			"token_type":   tokenType,
			"expires_in":   expiresIn,
		}
		body, err := json.Marshal(response)
		require.NoError(t, err)

		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader(string(body))),
			Header:     make(http.Header),
		}
	})
}
