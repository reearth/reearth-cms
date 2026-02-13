package publicapi

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-cms/server/internal/adapter"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/exporters"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

func (c *Controller) GetItem(ctx context.Context, wsAlias, pAlias, mKey, i string) (Item, error) {
	wpm, err := c.loadWPMContext(ctx, wsAlias, pAlias, mKey)
	if err != nil {
		return Item{}, err
	}

	if mKey == "" {
		return Item{}, rerror.ErrNotFound
	}

	iid, err := id.ItemIDFrom(i)
	if err != nil {
		return Item{}, rerror.ErrNotFound
	}

	it, err := c.usecases.Item.FindPublicByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Item{}, rerror.ErrNotFound
		}
		return Item{}, err
	}

	itv := it.Value()

	sp, err := c.usecases.Schema.FindByModel(ctx, wpm.Model.ID(), nil)
	if err != nil {
		return Item{}, err
	}

	var assets asset.List
	if wpm.PublicAssets {
		assets, err = c.usecases.Asset.FindByIDs(ctx, itv.AssetIDs(), nil)
		if err != nil {
			return Item{}, err
		}
	}

	return NewItem(itv, sp, assets, getReferencedItems(ctx, itv, wpm.PublicAssets)), nil
}

func (c *Controller) GetPublicItems(ctx context.Context, wsAlias, pAlias, mKey, ext string, p *usecasex.Pagination, w io.Writer) error {
	wpm, err := c.loadWPMContext(ctx, wsAlias, pAlias, mKey)
	if err != nil {
		return err
	}

	sp, err := c.usecases.Schema.FindByModel(ctx, wpm.Model.ID(), nil)
	if err != nil {
		return err
	}

	format := exporters.FormatJSON
	switch ext {
	case "json":
		format = exporters.FormatJSON
	case "geojson":
		format = exporters.FormatGeoJSON
	case "csv":
		format = exporters.FormatCSV
	}

	err = c.usecases.Item.Export(ctx, interfaces.ExportItemParams{
		ModelID:       wpm.Model.ID(),
		SchemaPackage: *sp,
		Format:        format,
		Options: exporters.ExportOptions{
			PublicOnly:       true,
			IncludeAssets:    wpm.PublicAssets,
			IncludeGeometry:  true,
			GeometryField:    nil,
			Pagination:       p,
			IncludeRefModels: wpm.PublicModels,
		},
	}, w, nil)
	if err != nil {
		return err
	}

	return nil
}

func getReferencedItems(ctx context.Context, i *item.Item, prp bool) []Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	// Step 1: Collect all referenced item IDs
	var refItemIDs []id.ItemID
	for _, f := range i.Fields().FieldsByType(value.TypeReference) {
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if ok {
				refItemIDs = append(refItemIDs, iid)
			}
		}
	}

	if len(refItemIDs) == 0 {
		return nil
	}

	// Step 2: Batch load all referenced items
	referencedItems, err := uc.Item.FindByIDs(ctx, refItemIDs, op)
	if err != nil || len(referencedItems) == 0 {
		return nil
	}

	// Step 3: Collect unique model IDs and load schemas
	modelIDs := make(map[id.ModelID]bool)
	for _, ii := range referencedItems {
		modelIDs[ii.Value().Model()] = true
	}

	// Step 4: Load schemas for unique models
	schemaMap := make(map[id.ModelID]*schema.Package)
	for modelID := range modelIDs {
		sp, err := uc.Schema.FindByModel(ctx, modelID, op)
		if err == nil && sp != nil {
			schemaMap[modelID] = sp
		}
	}

	// Step 5: Batch load all assets if needed
	var assetsMap asset.Map
	if prp {
		var allAssetIDs []id.AssetID
		for _, ii := range referencedItems {
			allAssetIDs = append(allAssetIDs, ii.Value().AssetIDs()...)
		}
		if len(allAssetIDs) > 0 {
			assets, err := uc.Asset.FindByIDs(ctx, allAssetIDs, nil)
			if err == nil {
				assetsMap = assets.Map()
			}
		}
	}

	// Step 6: Build result from loaded data
	vi := make([]Item, 0, len(referencedItems))
	for _, ii := range referencedItems {
		sp, ok := schemaMap[ii.Value().Model()]
		if !ok {
			continue
		}

		var itemAssets asset.List
		if prp && assetsMap != nil {
			for _, aid := range ii.Value().AssetIDs() {
				if a, exists := assetsMap[aid]; exists {
					itemAssets = append(itemAssets, a)
				}
			}
		}

		vi = append(vi, NewItem(ii.Value(), sp, itemAssets, nil))
	}

	return vi
}
