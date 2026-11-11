package serve

import (
	"context"
	"net/http"
)

// TokenFunc resolves the bearer token for an outgoing request from its context.
// An empty token sends the request without an Authorization header.
type TokenFunc func(ctx context.Context) string

// NewTokenTransport returns a RoundTripper that attaches the bearer token
// resolved by token to each request. A nil base uses http.DefaultTransport.
func NewTokenTransport(base http.RoundTripper, token TokenFunc) http.RoundTripper {
	if base == nil {
		base = http.DefaultTransport
	}
	return &tokenTransport{base: base, token: token}
}

type tokenTransport struct {
	base  http.RoundTripper
	token TokenFunc
}

func (t *tokenTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if t.token == nil {
		return t.base.RoundTrip(req)
	}
	tok := t.token(req.Context())
	if tok == "" {
		return t.base.RoundTrip(req)
	}
	req = req.Clone(req.Context())
	req.Header.Set("Authorization", "Bearer "+tok)
	return t.base.RoundTrip(req)
}
