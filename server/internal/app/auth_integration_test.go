package app

import (
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-jose/go-jose/v4"
	josejwt "github.com/go-jose/go-jose/v4/jwt"
	"github.com/labstack/echo/v5"
	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/samber/lo"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestIntegrationJWTParseMiddleware(t *testing.T) {
	t.Parallel()

	key := lo.Must(rsa.GenerateKey(rand.Reader, 2048))
	jwks := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(jose.JSONWebKeySet{Keys: []jose.JSONWebKey{
			{KeyID: "0", Key: &key.PublicKey, Algorithm: string(jose.RS256), Use: "sig"},
		}})
	}))
	t.Cleanup(jwks.Close)

	iss := jwks.URL + "/"
	appCtx := &ApplicationContext{Config: &Config{
		Auth_ISS:     iss,
		Auth_AUD:     "cms",
		Auth_JWKSURI: lo.ToPtr(jwks.URL),
	}}

	signer := lo.Must(jose.NewSigner(
		jose.SigningKey{Algorithm: jose.RS256, Key: key},
		(&jose.SignerOptions{}).WithType("JWT").WithHeader("kid", "0"),
	))
	validJWT := lo.Must(josejwt.Signed(signer).Claims(josejwt.Claims{
		Issuer:   iss,
		Subject:  "user-sub",
		Audience: josejwt.Audience{"cms"},
		Expiry:   josejwt.NewNumericDate(time.Now().Add(time.Hour)),
	}).Serialize())

	e := echo.New()
	e.GET("/", func(c *echo.Context) error {
		sub := ""
		if ai := adapter.GetAuthInfo(c.Request().Context()); ai != nil {
			sub = ai.Sub
		}
		return c.String(http.StatusOK, sub)
	}, integrationJWTParseMiddleware(appCtx))

	tests := []struct {
		name       string
		authHeader string
		wantStatus int
		wantSub    string
	}{
		{name: "valid user JWT attaches auth info", authHeader: "Bearer " + validJWT, wantStatus: http.StatusOK, wantSub: "user-sub"},
		{name: "integration token skips JWT parsing", authHeader: "Bearer secret_abc", wantStatus: http.StatusOK},
		{name: "no authorization header passes through", wantStatus: http.StatusOK},
		{name: "invalid JWT is rejected", authHeader: "Bearer not-a-jwt", wantStatus: http.StatusUnauthorized},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			req := httptest.NewRequest(http.MethodGet, "/", nil)
			if tt.authHeader != "" {
				req.Header.Set("Authorization", tt.authHeader)
			}
			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, req)

			require.Equal(t, tt.wantStatus, rec.Code, rec.Body.String())
			if tt.wantStatus == http.StatusOK {
				assert.Equal(t, tt.wantSub, rec.Body.String())
			}
		})
	}
}
