package app

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	jose "gopkg.in/go-jose/go-jose.v2"
	"gopkg.in/go-jose/go-jose.v2/jwt"
)

const (
	m2mTestIssuer   = "https://example.com"
	m2mTestAudience = "test-aud"
	m2mTestEmail    = "m2m@example.com"
	m2mTestKeyID    = "test-key"
)

// newTestJWKSServer serves the public half of key as a JWKS document.
func newTestJWKSServer(t *testing.T, key *rsa.PrivateKey) *httptest.Server {
	t.Helper()

	keySet := jose.JSONWebKeySet{
		Keys: []jose.JSONWebKey{
			{Key: &key.PublicKey, KeyID: m2mTestKeyID, Algorithm: "RS256", Use: "sig"},
		},
	}

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		require.NoError(t, json.NewEncoder(w).Encode(keySet))
	}))
	t.Cleanup(srv.Close)

	return srv
}

// signTestM2MToken signs a JWT with the given custom claims (e.g. email, email_verified).
func signTestM2MToken(key *rsa.PrivateKey, custom map[string]any) string {
	signer := lo.Must( jose.NewSigner(
		jose.SigningKey{Algorithm: jose.RS256, Key: key},
		(&jose.SignerOptions{}).WithType("JWT").WithHeader("kid", m2mTestKeyID),
	))

	claims := jwt.Claims{
		Issuer:   m2mTestIssuer,
		Audience: jwt.Audience{m2mTestAudience},
		Subject:  "m2m-client",
		IssuedAt: jwt.NewNumericDate(time.Now()),
		Expiry:   jwt.NewNumericDate(time.Now().Add(time.Hour)),
	}

	return lo.Must(jwt.Signed(signer).Claims(claims).Claims(custom).CompactSerialize())
}

func newTestM2MConfig(jwksURI string) *Config {
	return &Config{
		AuthM2M: AuthM2MConfig{
			ISS:     m2mTestIssuer,
			AUD:     []string{m2mTestAudience},
			JWKSURI: &jwksURI,
			Email:   m2mTestEmail,
		},
	}
}

func TestM2MAuthMiddleware(t *testing.T) {
	t.Parallel()

	key, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	jwksServer := newTestJWKSServer(t, key)
	cfg := newTestM2MConfig(jwksServer.URL)

	tests := []struct {
		name          string
		token         string
		wantStatus    int
		wantCalled    bool
		checkOperator bool
	}{
		{
			name: "valid token",
			token:  signTestM2MToken(key, map[string]any{
					"email":          m2mTestEmail,
					"email_verified": true,
				}),
			wantStatus:    http.StatusOK,
			wantCalled:    true,
			checkOperator: true,
		},
		{
			name: "token signed with wrong key",
			token: signTestM2MToken(lo.Must(rsa.GenerateKey(rand.Reader, 2048)), map[string]any{
				"email":          m2mTestEmail,
				"email_verified": true,
			}),
			wantStatus: http.StatusUnauthorized,
			wantCalled: false,
		},
		{
			name:       "missing token",
			token:      "",
			wantStatus: http.StatusBadRequest,
			wantCalled: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			m := M2MAuthMiddleware(cfg)

			e := echo.New()
			r := httptest.NewRequest(http.MethodGet, "/", nil)
			if tt.token != "" {
				r.Header.Set("Authorization", "Bearer "+tt.token)
			}
			w := httptest.NewRecorder()
			c := e.NewContext(r, w)

			called := false
			err := m(func(c *echo.Context) error {
				called = true
				if tt.checkOperator {
					o := adapter.Operator(c.Request().Context())
					assert.True(t, o.Machine)
				}
				return c.String(http.StatusOK, "ok")
			})(c)

			assert.NoError(t, err)
			assert.Equal(t, tt.wantCalled, called)
			assert.Equal(t, tt.wantStatus, w.Code)
		})
	}
}
