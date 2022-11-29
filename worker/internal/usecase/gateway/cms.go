package gateway

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/asset"
)

type CMS interface {
	NotifyAssetDecompressed(ctx context.Context, assetID string, status *asset.Status) error
}
