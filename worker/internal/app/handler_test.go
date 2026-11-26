package app

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/idtoken"
)

// Regression test for SEC-08/SEC-10: no request header may bypass Pub/Sub OIDC on the push routes.
func TestRoutes_RequireOIDC(t *testing.T) {
	tests := []struct {
		name       string
		authHeader string
		snsHeader  string
	}{
		{name: "no token"},
		{name: "forged token", authHeader: "Bearer forged"},
		{name: "no token with old SNS header", snsHeader: "Notification"},
		{name: "forged token with old SNS header", authHeader: "Bearer forged", snsHeader: "SubscriptionConfirmation"},
	}

	for _, endpoint := range []string{"/api/webhook", "/api/decompress"} {
		for _, tt := range tests {
			t.Run(endpoint+"/"+tt.name, func(t *testing.T) {
				var oidcCalls atomic.Int32
				auth := newTestAuth(validPayload(), nil)
				validate := auth.validate
				auth.validate = func(ctx context.Context, token, audience string) (*idtoken.Payload, error) {
					oidcCalls.Add(1)
					return validate(ctx, token, audience)
				}
				// The controller is empty on purpose: reaching it would panic (500), so a 401 proves the request stopped at auth.
				e := initEcho(context.Background(), &ServerConfig{Config: &Config{}}, NewHandler(&rhttp.Controller{}, auth))

				req := httptest.NewRequest(http.MethodPost, endpoint, strings.NewReader(`{"url":"http://169.254.169.254/","assetId":"x","path":"a.zip"}`))
				req.Header.Set("Content-Type", "application/json")
				if tt.authHeader != "" {
					req.Header.Set("Authorization", tt.authHeader)
				}
				if tt.snsHeader != "" {
					req.Header.Set("X-Amz-Sns-Message-Type", tt.snsHeader)
				}
				rec := httptest.NewRecorder()

				e.ServeHTTP(rec, req)

				assert.Equal(t, http.StatusUnauthorized, rec.Code)
				if tt.authHeader != "" {
					assert.Equal(t, int32(1), oidcCalls.Load(), "the token must be checked")
				}
			})
		}
	}
}
