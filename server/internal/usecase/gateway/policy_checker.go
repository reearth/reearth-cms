package gateway

import (
	"context"
)

type PolicyCheckType string

const (
	PolicyCheckCMSPrivateDataTransferUpload   PolicyCheckType = "cms_private_data_transfer_upload_size"
	PolicyCheckCMSPrivateDataTransferDownload PolicyCheckType = "cms_private_data_transfer_download_size"
	PolicyCheckCMSPublicDataTransferUpload    PolicyCheckType = "cms_public_data_transfer_upload_size"
	PolicyCheckCMSPublicDataTransferDownload  PolicyCheckType = "cms_public_data_transfer_download_size"
	PolicyCheckCMSUploadAssetsSize            PolicyCheckType = "cms_upload_assets_size_from_ui"
	PolicyCheckCMSModelCountPerProject        PolicyCheckType = "cms_model_count_per_project"
	PolicyCheckGeneralPrivateProjectCreation  PolicyCheckType = "general_private_project_creation"
	PolicyCheckGeneralPublicProjectCreation   PolicyCheckType = "general_public_project_creation"
)

type PolicyCheckRequest struct {
	WorkspaceID string
	CheckType   PolicyCheckType
	Value       int64
}

type PolicyCheckResponse struct {
	Allowed      bool
	CheckType    PolicyCheckType
	CurrentLimit string
	Message      string
	Value        int64
}

type PolicyChecker interface {
	CheckPolicy(ctx context.Context, req PolicyCheckRequest) (*PolicyCheckResponse, error)
}
