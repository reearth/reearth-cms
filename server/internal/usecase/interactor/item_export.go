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
		ItemLoader: func(itemIDs id.ItemIDList) (item.List, error) {
			versioned, err := i.repos.Item.FindByIDs(ctx, itemIDs, version.Public.Ref())
			if err != nil {
				return nil, err
			}
			return versioned.Unwrap(), nil
		},
		AssetLoader: func(assetIDs id.AssetIDList) (asset.List, error) {
			if !params.Options.IncludeAssets {
				return nil, nil
			}
			return i.repos.Asset.FindByIDs(ctx, assetIDs)
		},
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

	totalProcessed := 0
	pageInfo := &usecasex.PageInfo{}
	for {
		versionedItems, pi, err := i.repos.Item.FindByModel(ctx, params.ModelID, ver, nil, pagination)
		if err != nil {
			return rerror.ErrInternalBy(err)
		}
		pageInfo = pi

		items := versionedItems.Unwrap()
		if len(items) == 0 {
			break
		}

		// Extract and load assets for this batch
		assetIDs := items.AssetIDs(params.SchemaPackage)
		var assets asset.List
		if len(assetIDs) > 0 && params.Options.IncludeAssets {
			assets, err = i.repos.Asset.FindByIDs(ctx, assetIDs)
			if err != nil {
				return rerror.ErrInternalBy(err)
			}
			if assets != nil {
				assets.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
			}
		}

		// Process this batch
		if err := exporter.ProcessBatch(ctx, items, assets); err != nil {
			return err
		}

		totalProcessed += len(items)

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
