package policy

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
)

type WebhookPolicyChecker struct {
	endpoint string
	token    string
	client   *http.Client
}

func NewWebhookPolicyChecker(endpoint, token string, timeoutSeconds int) *WebhookPolicyChecker {
	return &WebhookPolicyChecker{
		endpoint: endpoint,
		token:    token,
		client: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
}

func (w *WebhookPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to marshal policy request: %w", err))
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, w.endpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to create policy check request: %w", err))
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if w.token != "" {
		httpReq.Header.Set("Authorization", "Bearer "+w.token)
	}

	resp, err := w.client.Do(httpReq)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("policy check request failed: %w", err))
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, rerror.ErrInternalBy(fmt.Errorf("policy check returned status %d", resp.StatusCode))
	}

	var policyResp gateway.PolicyCheckResponse
	if err := json.NewDecoder(resp.Body).Decode(&policyResp); err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to decode policy response: %w", err))
	}

	return &policyResp, nil
}
