package interactor

import (
	"context"
	"io"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type BatchConfig struct {
	BatchSize int64
}

// DefaultBatchConfig returns sensible defaults for batch processing
func defaultBatchConfig() *BatchConfig {
	return &BatchConfig{
		BatchSize: 1000,
	}
}

func (i Item) Export(ctx context.Context, params interfaces.ExportItemParams, w io.Writer, op *usecase.Operator) error {
	// Create the exporter based on format
	var exporter exporters.Exporter
	switch params.Format {
	case exporters.FormatJSON:
		exporter = exporters.NewJSONExporter(w)
	case exporters.FormatCSV:
		exporter = exporters.NewCSVExporter(w)
	case exporters.FormatGeoJSON:
		exporter = exporters.NewGeoJSONExporter(w)
	default:
		return rerror.NewE(i18n.T("unsupported export format"))
	}

	req := &exporters.ExportRequest{
		Format:  params.Format,
		ModelID: params.ModelID,
		Schema:  params.SchemaPackage,
		Options: params.Options,
	}

	if err := exporter.ValidateRequest(req); err != nil {
		return err
	}

	if err := exporter.StartExport(ctx, req); err != nil {
		return err
	}

	batchConfig := defaultBatchConfig()

	pagination := usecasex.CursorPagination{First: &batchConfig.BatchSize}.Wrap()
	if params.Options.Pagination != nil {
		pagination = params.Options.Pagination
	}

	ver := version.Public.Ref()
	if !params.Options.PublicOnly {
		ver = nil
	}

	pageInfo := &usecasex.PageInfo{}

	for {
		// Check if context has been cancelled (client disconnect, timeout, etc.)
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			// Continue processing
		}

		versionedItems, pi, err := i.repos.Item.FindByModel(ctx, params.ModelID, ver, nil, pagination)
		if err != nil {
			return rerror.ErrInternalBy(err)
		}
		pageInfo = pi

		items := versionedItems.Unwrap()
		if len(items) == 0 {
			break
		}

		// Pre-load all referenced items for this batch
		// Note: We load ALL referenced items first, then filter by IncloudRefModels
		// in the ItemLoader to respect privacy settings while avoiding N+1 queries
		refItemIDs := items.RefItemIDs()
		var referencedItemsMap map[id.ItemID]*item.Item
		if len(refItemIDs) > 0 {
			versionedRefs, err := i.repos.Item.FindByIDs(ctx, refItemIDs, ver)
			if err != nil {
				log.Errorfc(ctx, "export: failed to pre-load %d referenced items: %v", len(refItemIDs), err)
			} else {
				referencedItemsMap = versionedRefs.Unwrap().ToMap()
			}
		}

		// Create ItemLoader closure that uses pre-loaded cache
		// Filter by IncludeRefModels if specified (for public API privacy)
		req.ItemLoader = func(itemIDs id.ItemIDList) (item.List, error) {
			if referencedItemsMap == nil {
				return nil, nil
			}

			// Build allowed models set if filter is specified
			var allowedModels map[id.ModelID]bool
			if len(params.Options.IncludeRefModels) > 0 {
				allowedModels = make(map[id.ModelID]bool)
				for _, mid := range params.Options.IncludeRefModels {
					allowedModels[mid] = true
				}
			}

			result := make(item.List, 0, len(itemIDs))
			for _, iid := range itemIDs {
				if refItem, ok := referencedItemsMap[iid]; ok {
					// If filter is set, only include items from allowed models
					if allowedModels != nil {
						if allowedModels[refItem.Model()] {
							result = append(result, refItem)
						}
						// If not in allowed models, don't include (will show as ID string)
					} else {
						// No filter - include all
						result = append(result, refItem)
					}
				}
			}
			return result, nil
		}

		// Extract and load assets for this batch
		assetIDs := items.AssetIDs(params.SchemaPackage)
		var assetsMap asset.Map
		var assets asset.List
		if len(assetIDs) > 0 && params.Options.IncludeAssets {
			assets, err = i.repos.Asset.FindByIDs(ctx, assetIDs)
			if err != nil {
				log.Errorfc(ctx, "export: failed to pre-load %d assets: %v", len(assetIDs), err)
			} else if assets != nil {
				assets.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
				assetsMap = assets.Map()
			}
		}

		// Create AssetLoader closure for this batch using pre-loaded cache
		req.AssetLoader = func(assetIDs id.AssetIDList) (asset.List, error) {
			if !params.Options.IncludeAssets || assetsMap == nil {
				return nil, nil
			}
			result := make(asset.List, 0, len(assetIDs))
			for _, aid := range assetIDs {
				if a, exists := assetsMap[aid]; exists {
					result = append(result, a)
				}
			}
			return result, nil
		}

		// Process this batch
		if err := exporter.ProcessBatch(ctx, items, assets); err != nil {
			return err
		}

		// Check if we have more pages
		if pageInfo == nil || !pageInfo.HasNextPage {
			break
		}

		// if exact page requested, stop after one batch
		if params.Options.Pagination != nil {
			break
		}

		// Update pagination for next batch
		pagination.Cursor.After = pageInfo.EndCursor
	}

	props := map[string]any{
		"totalCount": pageInfo.TotalCount,
	}

	if req.Options.Pagination != nil {
		props["hasMore"] = pageInfo.HasNextPage
		if req.Options.Pagination.Cursor != nil {
			props["nextCursor"] = pageInfo.EndCursor
			// props["limit"] = req.Options.Pagination
		}
		if req.Options.Pagination.Offset != nil {
			props["page"] = (req.Options.Pagination.Offset.Offset / req.Options.Pagination.Offset.Limit) + 1
			props["offset"] = req.Options.Pagination.Offset.Offset
			props["limit"] = req.Options.Pagination.Offset.Limit
		}
	}

	// Finalize export
	return exporter.EndExport(ctx, props)
}
