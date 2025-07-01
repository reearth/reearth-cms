package dashboard

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/workspaceplan"
)

type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func New(baseURL, token string) gateway.Dashboard {
	return &Client{
		baseURL: baseURL,
		token:   token,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (c *Client) GetWorkspacePlan(ctx context.Context, workspaceID string) (*workspaceplan.Plan, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/plan/%s", c.baseURL, workspaceID), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status from accounts API: %d", resp.StatusCode)
	}

	var res Plan
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	return &workspaceplan.Plan{
		Type: FromPlanType(res.Type),
	}, nil
}
