package app

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"
	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/idtoken"
)

const (
	testAudience = "https://worker.example.com/api/webhook"
	testSA       = "pubsub-push@example.iam.gserviceaccount.com"
)

func validPayload() *idtoken.Payload {
	return &idtoken.Payload{
		Issuer:   "https://accounts.google.com",
		Audience: testAudience,
		Claims: map[string]any{
			"email":          testSA,
			"email_verified": true,
		},
	}
}

func newTestAuth(p *idtoken.Payload, err error) *PubSubAuthenticator {
	return &PubSubAuthenticator{
		audience:       testAudience,
		serviceAccount: testSA,
		validate: func(_ context.Context, token, audience string) (*idtoken.Payload, error) {
			if token != "good-token" || audience != testAudience {
				return nil, errors.New("invalid")
			}
			return p, err
		},
	}
}

func TestPubSubAuthenticator_Authenticate(t *testing.T) {
	tests := []struct {
		name    string
		auth    *PubSubAuthenticator
		header  string
		wantErr bool
	}{
		{name: "valid", auth: newTestAuth(validPayload(), nil), header: "Bearer good-token"},
		{name: "lowercase bearer", auth: newTestAuth(validPayload(), nil), header: "bearer good-token"},
		{name: "no header", auth: newTestAuth(validPayload(), nil), header: "", wantErr: true},
		{name: "not bearer", auth: newTestAuth(validPayload(), nil), header: "Basic Zm9vOmJhcg==", wantErr: true},
		{name: "invalid token", auth: newTestAuth(validPayload(), nil), header: "Bearer forged", wantErr: true},
		{name: "validator error", auth: newTestAuth(nil, errors.New("expired")), header: "Bearer good-token", wantErr: true},
		{
			name: "wrong issuer",
			auth: newTestAuth(func() *idtoken.Payload { p := validPayload(); p.Issuer = "https://evil.example.com"; return p }(), nil),
			header: "Bearer good-token", wantErr: true,
		},
		{
			name: "wrong audience",
			auth: newTestAuth(func() *idtoken.Payload { p := validPayload(); p.Audience = "other"; return p }(), nil),
			header: "Bearer good-token", wantErr: true,
		},
		{
			name: "wrong service account",
			auth: newTestAuth(func() *idtoken.Payload { p := validPayload(); p.Claims["email"] = "attacker@example.com"; return p }(), nil),
			header: "Bearer good-token", wantErr: true,
		},
		{
			name: "email not verified",
			auth: newTestAuth(func() *idtoken.Payload { p := validPayload(); p.Claims["email_verified"] = false; return p }(), nil),
			header: "Bearer good-token", wantErr: true,
		},
		{name: "nil authenticator", auth: nil, header: "Bearer good-token", wantErr: true},
		{name: "not configured (prod)", auth: NewPubSubAuthenticator(PubSubConfig{}, false), header: "Bearer good-token", wantErr: true},
		{name: "not configured (dev)", auth: NewPubSubAuthenticator(PubSubConfig{}, true), header: ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPost, "/api/webhook", nil)
			if tt.header != "" {
				r.Header.Set("Authorization", tt.header)
			}
			err := tt.auth.Authenticate(r)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestHandler_RejectsUnauthenticatedPubSub(t *testing.T) {
	// Controller is nil on purpose: reaching it would panic, proving the request was rejected first.
	h := NewHandler(&rhttp.Controller{}, newTestAuth(validPayload(), nil))
	e := echo.New()

	for name, hf := range map[string]echo.HandlerFunc{
		"webhook":    h.WebhookHandler(),
		"decompress": h.DecompressHandler(),
	} {
		t.Run(name, func(t *testing.T) {
			body := `{"url":"http://169.254.169.254/","assetId":"x","path":"../../etc"}`
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			c := e.NewContext(req, httptest.NewRecorder())

			err := hf(c)
			var he *echo.HTTPError
			assert.True(t, errors.As(err, &he))
			assert.Equal(t, http.StatusUnauthorized, he.Code)
		})
	}
}
