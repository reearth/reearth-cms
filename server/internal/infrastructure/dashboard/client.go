package dashboard

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type CheckType string

const (
	CheckTypeCMSPrivateDataTransferUploadSize   CheckType = "cms_private_data_transfer_upload_size"
	CheckTypeCMSPrivateDataTransferDownloadSize CheckType = "cms_private_data_transfer_download_size"
	CheckTypeCMSPublicDataTransferUploadSize    CheckType = "cms_public_data_transfer_upload_size"
	CheckTypeCMSPublicDataTransferDownloadSize  CheckType = "cms_public_data_transfer_download_size"
	CheckTypeCMSUploadAssetsSizeFromUI          CheckType = "cms_upload_assets_size_from_ui"
	CheckTypeCMSModelCountPerProject            CheckType = "cms_model_count_per_project"
	CheckTypeGeneralPrivateProjectCreation      CheckType = "general_private_project_creation"
	CheckTypeGeneralPublicProjectCreation       CheckType = "general_public_project_creation"
)

type CheckPlanConstraintsRequest struct {
	CheckType CheckType `json:"check_type"`
	Value     int64     `json:"value"`
}

type CheckPlanConstraintsResponse struct {
	Allowed      bool      `json:"allowed"`
	CheckType    CheckType `json:"check_type"`
	CurrentLimit string    `json:"current_limit"`
	Message      string    `json:"message"`
	Value        int64     `json:"value"`
}

type Client struct {
	baseURL    string
	httpClient *http.Client
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) CheckPlanConstraints(ctx context.Context, workspaceID string, req CheckPlanConstraintsRequest) (*CheckPlanConstraintsResponse, error) {
	url := fmt.Sprintf("%s/api/workspaces/%s/check-plan-constraints", c.baseURL, workspaceID)

	requestBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status %d", resp.StatusCode)
	}

	var response CheckPlanConstraintsResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &response, nil
}