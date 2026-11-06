package app

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearthx/log"
	"google.golang.org/api/idtoken"
)

var googleIssuers = []string{"accounts.google.com", "https://accounts.google.com"}

var errPubSubUnauthorized = echo.NewHTTPError(http.StatusUnauthorized, "unauthorized")

type idTokenValidator func(ctx context.Context, token, audience string) (*idtoken.Payload, error)

// PubSubAuthenticator verifies the OIDC token that Pub/Sub attaches to authenticated push requests.
type PubSubAuthenticator struct {
	audience       string
	serviceAccount string
	skip           bool
	validate       idTokenValidator
}

func NewPubSubAuthenticator(cfg PubSubConfig, dev bool) *PubSubAuthenticator {
	a := &PubSubAuthenticator{
		audience:       cfg.Audience,
		serviceAccount: cfg.ServiceAccount,
		validate:       idtoken.Validate,
	}

	if a.audience == "" || a.serviceAccount == "" {
		if dev {
			log.Warnf("pubsub auth: audience or service account is not configured; push requests are NOT authenticated (dev mode)")
			a.skip = true
		} else {
			log.Warnf("pubsub auth: audience or service account is not configured; all Pub/Sub push requests will be rejected")
		}
	}

	return a
}

func (a *PubSubAuthenticator) Authenticate(r *http.Request) error {
	if a == nil {
		return errPubSubUnauthorized
	}
	if a.skip {
		return nil
	}
	if a.audience == "" || a.serviceAccount == "" || a.validate == nil {
		return errPubSubUnauthorized
	}

	token, ok := bearerToken(r)
	if !ok {
		return errPubSubUnauthorized
	}

	payload, err := a.validate(r.Context(), token, a.audience)
	if err != nil {
		log.Warnf("pubsub auth: invalid token: %v", err)
		return errPubSubUnauthorized
	}

	if err := a.checkClaims(payload); err != nil {
		log.Warnf("pubsub auth: %v", err)
		return errPubSubUnauthorized
	}

	return nil
}

func (a *PubSubAuthenticator) checkClaims(p *idtoken.Payload) error {
	if p == nil {
		return errors.New("empty token payload")
	}

	issuerOK := false
	for _, iss := range googleIssuers {
		if p.Issuer == iss {
			issuerOK = true
			break
		}
	}
	if !issuerOK {
		return errors.New("unexpected issuer: " + p.Issuer)
	}

	if p.Audience != a.audience {
		return errors.New("unexpected audience: " + p.Audience)
	}

	email, _ := p.Claims["email"].(string)
	verified, _ := p.Claims["email_verified"].(bool)
	if !verified || !strings.EqualFold(email, a.serviceAccount) {
		return errors.New("unexpected service account: " + email)
	}

	return nil
}

func bearerToken(r *http.Request) (string, bool) {
	h := r.Header.Get("Authorization")
	const prefix = "bearer "
	if len(h) <= len(prefix) || !strings.EqualFold(h[:len(prefix)], prefix) {
		return "", false
	}
	token := strings.TrimSpace(h[len(prefix):])
	return token, token != ""
}
