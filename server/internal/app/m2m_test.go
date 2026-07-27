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
func signTestM2MToken(t *testing.T, key *rsa.PrivateKey, custom map[string]any) string {
	t.Helper()

	signer, err := jose.NewSigner(
		jose.SigningKey{Algorithm: jose.RS256, Key: key},
		(&jose.SignerOptions{}).WithType("JWT").WithHeader("kid", m2mTestKeyID),
	)
	require.NoError(t, err)

	claims := jwt.Claims{
		Issuer:   m2mTestIssuer,
		Audience: jwt.Audience{m2mTestAudience},
		Subject:  "m2m-client",
		IssuedAt: jwt.NewNumericDate(time.Now()),
		Expiry:   jwt.NewNumericDate(time.Now().Add(time.Hour)),
	}

	token, err := jwt.Signed(signer).Claims(claims).Claims(custom).CompactSerialize()
	require.NoError(t, err)

	return token
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
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	jwksServer := newTestJWKSServer(t, key)
	cfg := newTestM2MConfig(jwksServer.URL)

	t.Run("valid token", func(t *testing.T) {
		token := signTestM2MToken(t, key, map[string]any{
			"email":          m2mTestEmail,
			"email_verified": true,
		})

		m := M2MAuthMiddleware(cfg)

		e := echo.New()
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		c := e.NewContext(r, w)

		err := m(func(c *echo.Context) error {
			o := adapter.Operator(c.Request().Context())
			assert.True(t, o.Machine)
			return c.String(http.StatusOK, "ok")
		})(c)

		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("token signed with wrong key", func(t *testing.T) {
		otherKey, err := rsa.GenerateKey(rand.Reader, 2048)
		require.NoError(t, err)
		token := signTestM2MToken(t, otherKey, map[string]any{
			"email":          m2mTestEmail,
			"email_verified": true,
		})

		m := M2MAuthMiddleware(cfg)

		e := echo.New()
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		c := e.NewContext(r, w)

		called := false
		_ = m(func(c *echo.Context) error {
			called = true
			return c.String(http.StatusOK, "ok")
		})(c)

		assert.False(t, called)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("missing token", func(t *testing.T) {
		m := M2MAuthMiddleware(cfg)

		e := echo.New()
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		w := httptest.NewRecorder()
		c := e.NewContext(r, w)

		called := false
		_ = m(func(c *echo.Context) error {
			called = true
			return c.String(http.StatusOK, "ok")
		})(c)

		assert.False(t, called)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
