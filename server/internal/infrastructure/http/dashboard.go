package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/log"
)

type dashboardClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewDashboard creates a new dashboard API client
func NewDashboard(baseURL string) gateway.Dashboard {
	return &dashboardClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetWorkspaceSubscription fetches workspace subscription data from dashboard API
func (d *dashboardClient) GetWorkspaceSubscription(ctx context.Context, workspaceID accountdomain.WorkspaceID, authToken string) (*gateway.WorkspaceSubscription, error) {
	url := fmt.Sprintf("%s/api/workspaces/%s/subscription", d.baseURL, workspaceID.String())
	
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Add Bearer token authorization
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authToken))
	req.Header.Set("Content-Type", "application/json")
	
	log.Debugf("dashboard: requesting subscription data for workspace %s", workspaceID.String())
	
	resp, err := d.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request to dashboard API: %w", err)
	}
	defer func() {
		if closeErr := resp.Body.Close(); closeErr != nil {
			log.Warnf("dashboard: failed to close response body: %v", closeErr)
		}
	}()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("dashboard API returned non-200 status: %d", resp.StatusCode)
	}
	
	var subscription gateway.WorkspaceSubscription
	if err := json.NewDecoder(resp.Body).Decode(&subscription); err != nil {
		return nil, fmt.Errorf("failed to decode dashboard API response: %w", err)
	}
	
	log.Debugf("dashboard: received subscription data for workspace %s: plan_type=%s", workspaceID.String(), subscription.ContractedPlan.PlanType)
	
	return &subscription, nil
}