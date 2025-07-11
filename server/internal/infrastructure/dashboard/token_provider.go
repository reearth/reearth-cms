package dashboard

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
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
		return "", rerror.NewE(i18n.T("failed to marshal auth request body"))
	}

	req, err := http.NewRequest(http.MethodPost, t.tokenURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", rerror.NewE(i18n.T("failed to create auth request"))
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := t.httpClient.Do(req)
	if err != nil {
		return "", rerror.NewE(i18n.T("failed to auth request"))
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		// Read the error response body for better debugging
		body, _ := io.ReadAll(resp.Body)
		return "", rerror.NewE(i18n.T(fmt.Sprintf("failed to auth status %d: %s", resp.StatusCode, string(body))))
	}

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int64  `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", rerror.NewE(i18n.T("failed to decode auth response"))
	}

	if tokenResponse.AccessToken == "" {
		return "", rerror.NewE(i18n.T("failed to auth: empty access token received"))
	}

	t.token = tokenResponse.AccessToken
	t.expireAt = time.Now().Add(time.Duration(tokenResponse.ExpiresIn-60) * time.Second) // Refresh 1 minute before expiry

	return t.token, nil
}
