package app

import (
	"context"
	"net/http"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearthx/log"
)

// DynamicAuthTransport handles JWT token extraction from request context
type DynamicAuthTransport struct{}

func (t DynamicAuthTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	ctx := req.Context()

	// Add JWT token to request if available
	if token := getContextJWT(ctx); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
		log.Debugfc(ctx, "[Accounts API] Making authenticated request to %s", req.URL.String())
	} else {
		log.Warnfc(ctx, "[Accounts API] Making unauthenticated request to %s (no JWT token found)", req.URL.String())
	}

	resp, err := http.DefaultTransport.RoundTrip(req)
	if err != nil {
		log.Errorfc(req.Context(), "[Accounts API] Request failed: %v", err)
		return nil, err
	}

	log.Debugfc(ctx, "[Accounts API] Request successful, status: %d", resp.StatusCode)
	return resp, nil
}

func getContextJWT(ctx context.Context) string {

	if authInfo := adapter.GetAuthInfo(ctx); authInfo != nil && authInfo.Token != "" {
		return authInfo.Token
	}

	return ""
}
