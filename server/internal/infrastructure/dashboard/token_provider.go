package dashboard

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

// TokenProvider provides authentication tokens for the dashboard API
type TokenProvider struct {
	clientID     string
	clientSecret string
	audience     string
	tokenURL     string
	httpClient   *http.Client

	// Token cache
	token    string
	expireAt time.Time
	mutex    sync.RWMutex
}

// NewTokenProvider creates a new token provider for Auth0 machine-to-machine authentication
func NewTokenProvider(clientID, clientSecret, audience, tokenURL string) *TokenProvider {
	return &TokenProvider{
		clientID:     clientID,
		clientSecret: clientSecret,
		audience:     audience,
		tokenURL:     tokenURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetToken retrieves a valid token, refreshing if necessary
func (t *TokenProvider) GetToken() (string, error) {
	t.mutex.RLock()
	if t.token != "" && time.Now().Before(t.expireAt) {
		token := t.token
		t.mutex.RUnlock()
		return token, nil
	}
	t.mutex.RUnlock()

	return t.refreshToken()
}

// refreshToken fetches a new token from Auth0
func (t *TokenProvider) refreshToken() (string, error) {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	// Double-check pattern
	if t.token != "" && time.Now().Before(t.expireAt) {
		return t.token, nil
	}

	requestBody := map[string]string{
		"client_id":     t.clientID,
		"client_secret": t.clientSecret,
		"audience":      t.audience,
		"grant_type":    "client_credentials",
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal token request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, t.tokenURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create token request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := t.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute token request: %w", err)
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		// Read the error response body for better debugging
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("token request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int64  `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", fmt.Errorf("failed to decode token response: %w", err)
	}

	if tokenResponse.AccessToken == "" {
		return "", fmt.Errorf("empty access token received")
	}

	t.token = tokenResponse.AccessToken
	t.expireAt = time.Now().Add(time.Duration(tokenResponse.ExpiresIn-60) * time.Second) // Refresh 1 minute before expiry

	return t.token, nil
}
