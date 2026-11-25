package app

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"

	rhttp "github.com/reearth/reearth-cms/worker/internal/adapter/http"
	"github.com/stretchr/testify/assert"
	"google.golang.org/api/idtoken"
)

// snsLikeBody builds an AWS SNS style payload whose every URL points at target,
// so any outbound request triggered by the worker would hit the test server.
func snsLikeBody(msgType, target string) string {
	message := fmt.Sprintf(`{\"url\":\"%s/hook\",\"assetId\":\"asset\",\"path\":\"a.zip\"}`, target)
	return fmt.Sprintf(`{
		"Type": %q,
		"MessageId": "id",
		"TopicArn": "arn:aws:sns:us-east-1:123456789012:attacker",
		"Message": "%s",
		"Timestamp": "2026-11-25T00:00:00.000Z",
		"SignatureVersion": "1",
		"Signature": "c2lnbmF0dXJl",
		"SigningCertURL": "%s/cert.pem",
		"SubscribeURL": "%s/subscribe",
		"UnsubscribeURL": "%s/unsubscribe",
		"Token": "token"
	}`, msgType, message, target, target, target)
}

// newCountingAuth returns an authenticator whose validator accepts only "good-token"
// and counts how many times OIDC validation was attempted.
func newCountingAuth(calls *atomic.Int32) *PubSubAuthenticator {
	return &PubSubAuthenticator{
		audience:       testAudience,
		serviceAccount: testSA,
		validate: func(_ context.Context, token, audience string) (*idtoken.Payload, error) {
			calls.Add(1)
			if token != "good-token" || audience != testAudience {
				return nil, errors.New("invalid")
			}
			return validPayload(), nil
		},
	}
}

func TestRoutes_SNSHeadersRequireOIDC(t *testing.T) {
	var outbound atomic.Int32
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		outbound.Add(1)
		w.WriteHeader(http.StatusOK)
	}))
	defer target.Close()

	endpoints := []string{"/api/webhook", "/api/decompress"}
	msgTypes := []string{"Notification", "SubscriptionConfirmation"}
	authHeaders := map[string]string{
		"no token":     "",
		"forged token": "Bearer forged",
	}

	for _, endpoint := range endpoints {
		for _, msgType := range msgTypes {
			for authName, authHeader := range authHeaders {
				t.Run(fmt.Sprintf("%s/%s/%s", endpoint, msgType, authName), func(t *testing.T) {
					outbound.Store(0)
					var oidcCalls atomic.Int32
					// Controller is empty on purpose: reaching it would panic (500), so a 401 proves the request stopped at auth.
					h := NewHandler(&rhttp.Controller{}, newCountingAuth(&oidcCalls))
					e := initEcho(context.Background(), &ServerConfig{Config: &Config{}}, h)

					req := httptest.NewRequest(http.MethodPost, endpoint, strings.NewReader(snsLikeBody(msgType, target.URL)))
					req.Header.Set("Content-Type", "text/plain; charset=UTF-8")
					req.Header.Set("X-Amz-Sns-Message-Type", msgType)
					req.Header.Set("X-Amz-Sns-Topic-Arn", "arn:aws:sns:us-east-1:123456789012:attacker")
					if authHeader != "" {
						req.Header.Set("Authorization", authHeader)
					}
					rec := httptest.NewRecorder()

					e.ServeHTTP(rec, req)

					assert.Equal(t, http.StatusUnauthorized, rec.Code)
					assert.Zero(t, outbound.Load(), "no outbound request must be made")
					if authHeader != "" {
						// The SNS headers must not bypass OIDC: the token has to be checked.
						assert.Equal(t, int32(1), oidcCalls.Load())
					}
				})
			}
		}
	}
}

func TestRoutes_ValidOIDCPassesAuth(t *testing.T) {
	for _, endpoint := range []string{"/api/webhook", "/api/decompress"} {
		t.Run(endpoint, func(t *testing.T) {
			var oidcCalls atomic.Int32
			h := NewHandler(&rhttp.Controller{}, newCountingAuth(&oidcCalls))
			e := initEcho(context.Background(), &ServerConfig{Config: &Config{}}, h)

			// An unsupported content type makes binding fail right after auth, so the empty controller is never reached.
			req := httptest.NewRequest(http.MethodPost, endpoint, strings.NewReader("not json"))
			req.Header.Set("Content-Type", "text/plain")
			req.Header.Set("Authorization", "Bearer good-token")
			rec := httptest.NewRecorder()

			e.ServeHTTP(rec, req)

			assert.Equal(t, int32(1), oidcCalls.Load())
			assert.NotEqual(t, http.StatusUnauthorized, rec.Code)
			assert.GreaterOrEqual(t, rec.Code, 400)
			assert.Less(t, rec.Code, 500)
		})
	}
}
