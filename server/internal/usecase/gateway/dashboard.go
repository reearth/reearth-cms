package gateway

import (
	"context"

	"github.com/reearth/reearthx/account/accountdomain"
)

//go:generate go run github.com/golang/mock/mockgen -source=$GOFILE -destination=gatewaymock/$GOFILE

type Dashboard interface {
	GetWorkspaceSubscription(ctx context.Context, workspaceID accountdomain.WorkspaceID, authToken string) (*WorkspaceSubscription, error)
}

// WorkspaceSubscription represents the subscription data from dashboard API
type WorkspaceSubscription struct {
	ContractedPlan ContractedPlan `json:"contracted_plan"`
	ID             string         `json:"id"`
	Seat           Seat           `json:"seat"`
}

type ContractedPlan struct {
	Description string   `json:"description"`
	Features    Features `json:"features"`
	ID          string   `json:"id"`
	Interval    string   `json:"interval"`
	Name        string   `json:"name"`
	PlanType    string   `json:"plan_type"`
	Price       int      `json:"price"`
	PriceUnit   string   `json:"price_unit"`
}

type Features struct {
	CMS        CMSFeatures        `json:"cms"`
	General    GeneralFeatures    `json:"general"`
	Visualizer VisualizerFeatures `json:"visualizer"`
}

type CMSFeatures struct {
	ModelNumberPerProject int    `json:"model_number_per_project"`
	PrivateDownloadSize   string `json:"private_download_size"`
	PrivateUploadSize     string `json:"private_upload_size"`
	PublicDownloadSize    string `json:"public_download_size"`
	PublicUploadSize      string `json:"public_upload_size"`
	UploadAssetSizeFromUI string `json:"upload_asset_size_from_ui"`
}

type GeneralFeatures struct {
	PrivateProject bool `json:"private_project"`
	PublicProject  bool `json:"public_project"`
}

type VisualizerFeatures struct {
	AssetSize          string `json:"asset_size"`
	CustomDomainNumber int    `json:"custom_domain_number"`
}

type Seat struct {
	Total int `json:"total"`
	Used  int `json:"used"`
}
