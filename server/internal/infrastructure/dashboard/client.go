package dashboard

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

const (
	CheckConstraintsPath = "/api/workspaces/%s/check-plan-constraints"
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
	baseURL       string
	authenticator Authenticator
	httpClient    *http.Client
}

type Authenticator interface {
	GetToken() (string, error)
}

func NewClient(baseURL string, authenticator Authenticator) *Client {
	return &Client{
		baseURL:       baseURL,
		authenticator: authenticator,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) CheckPlanConstraints(ctx context.Context, workspaceID string, req CheckPlanConstraintsRequest) (*CheckPlanConstraintsResponse, error) {
	encodedWorkspaceID := url.PathEscape(workspaceID)
	requestURL := fmt.Sprintf("%s"+CheckConstraintsPath, c.baseURL, encodedWorkspaceID)

	requestBody, err := json.Marshal(req)
	if err != nil {
		return nil, rerror.NewE(i18n.T("error marshalling request body for Dashboard API"))
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, requestURL, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, rerror.NewE(i18n.T("error creating API request"))
	}

	httpReq.Header.Set("Content-Type", "application/json")

	// Get token from authenticator
	if c.authenticator != nil {
		token, err := c.authenticator.GetToken()
		if err != nil {
			return nil, err // Already wrapped by token provider
		}
		if token != "" {
			httpReq.Header.Set("Authorization", "Bearer "+token)
		}
	}

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, rerror.NewE(i18n.T("error making API request"))
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	if resp.StatusCode != http.StatusOK {
		return nil, rerror.NewE(i18n.T(fmt.Sprintf("API request failed with status %d", resp.StatusCode)))
	}

	var response CheckPlanConstraintsResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, rerror.NewE(i18n.T("error decoding response"))
	}

	return &response, nil
}
