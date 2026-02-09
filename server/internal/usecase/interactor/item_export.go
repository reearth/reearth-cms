package interactor

import (
	"context"
	"io"
	"time"

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
	exportStart := time.Now()
	log.Infofc(ctx, "usecase: [START] Export - format=%v, modelID=%v", params.Format, params.ModelID)

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
			loadStart := time.Now()
			versioned, err := i.repos.Item.FindByIDs(ctx, itemIDs, version.Public.Ref())
			log.Infofc(ctx, "usecase: ItemLoader - loaded %d referenced items in %v", len(itemIDs), time.Since(loadStart))
			if err != nil {
				return nil, err
			}
			return versioned.Unwrap(), nil
		},
		AssetLoader: func(assetIDs id.AssetIDList) (asset.List, error) {
			if !params.Options.IncludeAssets {
				return nil, nil
			}
			loadStart := time.Now()
			assets, err := i.repos.Asset.FindByIDs(ctx, assetIDs)
			log.Infofc(ctx, "usecase: AssetLoader - loaded %d assets in %v", len(assetIDs), time.Since(loadStart))
			return assets, err
		},
	}

	validateStart := time.Now()
	if err := exporter.ValidateRequest(req); err != nil {
		return err
	}
	log.Infofc(ctx, "usecase: ValidateRequest took %v", time.Since(validateStart))

	startExportTime := time.Now()
	if err := exporter.StartExport(ctx, req); err != nil {
		return err
	}
	log.Infofc(ctx, "usecase: StartExport took %v", time.Since(startExportTime))

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
	batchNum := 0

	batchLoopStart := time.Now()
	for {
		batchNum++
		batchStart := time.Now()
		log.Infofc(ctx, "usecase: [START] Batch %d", batchNum)

		// Time DB query
		dbStart := time.Now()
		versionedItems, pi, err := i.repos.Item.FindByModel(ctx, params.ModelID, ver, nil, pagination)
		dbDuration := time.Since(dbStart)
		log.Infofc(ctx, "usecase: Batch %d - DB query took: %v", batchNum, dbDuration)

		if err != nil {
			return rerror.ErrInternalBy(err)
		}
		pageInfo = pi

		items := versionedItems.Unwrap()
		if len(items) == 0 {
			break
		}
		log.Infofc(ctx, "usecase: Batch %d - Retrieved %d items", batchNum, len(items))

		// Extract and load assets for this batch
		assetStart := time.Now()
		assetIDs := items.AssetIDs(params.SchemaPackage)
		var assets asset.List
		if len(assetIDs) > 0 && params.Options.IncludeAssets {
			log.Infofc(ctx, "usecase: Batch %d - Loading %d assets", batchNum, len(assetIDs))
			assets, err = i.repos.Asset.FindByIDs(ctx, assetIDs)
			if err != nil {
				return rerror.ErrInternalBy(err)
			}
			if assets != nil {
				resolverStart := time.Now()
				assets.SetAccessInfoResolver(i.gateways.File.GetAccessInfoResolver())
				log.Infofc(ctx, "usecase: Batch %d - SetAccessInfoResolver took: %v", batchNum, time.Since(resolverStart))
			}
		}
		assetDuration := time.Since(assetStart)
		log.Infofc(ctx, "usecase: Batch %d - Asset loading took: %v", batchNum, assetDuration)

		// Process this batch
		processBatchStart := time.Now()
		log.Infofc(ctx, "usecase: Batch %d - [START] ProcessBatch with %d items", batchNum, len(items))
		if err := exporter.ProcessBatch(ctx, items, assets); err != nil {
			return err
		}
		processBatchDuration := time.Since(processBatchStart)
		log.Infofc(ctx, "usecase: Batch %d - [END] ProcessBatch took: %v", batchNum, processBatchDuration)

		totalProcessed += len(items)
		batchDuration := time.Since(batchStart)
		log.Infofc(ctx, "usecase: Batch %d - Complete (batch took %v, total processed: %d)", batchNum, batchDuration, totalProcessed)

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

	batchLoopDuration := time.Since(batchLoopStart)
	log.Infofc(ctx, "usecase: All batches complete - %d batches, %d items, took %v", batchNum, totalProcessed, batchLoopDuration)

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
	endExportStart := time.Now()
	err := exporter.EndExport(ctx, props)
	log.Infofc(ctx, "usecase: EndExport took %v", time.Since(endExportStart))

	totalExportDuration := time.Since(exportStart)
	log.Infofc(ctx, "usecase: [END] Export complete - total duration: %v", totalExportDuration)

	return err
}
