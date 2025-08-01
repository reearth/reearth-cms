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

type HTTPPolicyChecker struct {
	endpoint string
	token    string
	client   *http.Client
}

func NewHTTPPolicyChecker(endpoint, token string, timeoutSeconds int) gateway.PolicyChecker {
	return &HTTPPolicyChecker{
		endpoint: endpoint,
		token:    token,
		client: &http.Client{
			Timeout: time.Duration(timeoutSeconds) * time.Second,
		},
	}
}

func (h *HTTPPolicyChecker) CheckPolicy(ctx context.Context, req gateway.PolicyCheckRequest) (*gateway.PolicyCheckResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to marshal policy request: %w", err))
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, h.endpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to create policy check request: %w", err))
	}

	httpReq.Header.Set("Content-Type", "application/json")
	if h.token != "" {
		httpReq.Header.Set("Authorization", "Bearer "+h.token)
	}

	resp, err := h.client.Do(httpReq)
	if err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("policy check request failed: %w", err))
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, rerror.ErrInternalBy(fmt.Errorf("policy check returned status %d", resp.StatusCode))
	}

	var policyResp gateway.PolicyCheckResponse
	if err := json.NewDecoder(resp.Body).Decode(&policyResp); err != nil {
		return nil, rerror.ErrInternalBy(fmt.Errorf("failed to decode policy response: %w", err))
	}

	return &policyResp, nil
}
