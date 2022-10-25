package gateway

import "context"

type CMS interface {
	NotifyAssetDecompressed(ctx context.Context, assetID string) error
}
