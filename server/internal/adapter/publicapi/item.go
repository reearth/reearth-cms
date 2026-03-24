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

	return NewItem(itv, sp, assets, getReferencedItems(ctx, itv, sp, wpm.PublicAssets)), nil
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

func getReferencedItems(ctx context.Context, i *item.Item, sp *schema.Package, prp bool) []Item {
	op := adapter.Operator(ctx)
	uc := adapter.Usecases(ctx)

	if i == nil {
		return nil
	}

	// Step 1: Collect all referenced item IDs
	refItemIDs := item.List{i}.RefItemIDs(*sp)

	if len(refItemIDs) == 0 {
		return nil
	}

	// Step 2: Batch load all referenced items
	referencedItems, err := uc.Item.FindByIDs(ctx, refItemIDs, op)
	if err != nil || len(referencedItems) == 0 {
		return nil
	}

	// Step 3: Batch load all assets if needed
	var assetsMap asset.Map
	if prp {
		var allAssetIDs asset.IDList
		for _, ii := range referencedItems {
			refSchema := sp.SchemaByModel(ii.Value().Model())
			if refSchema == nil {
				continue
			}
			refPkg := schema.NewPackage(refSchema, nil, nil, nil)
			allAssetIDs = allAssetIDs.AddUniq(ii.Value().AssetIDsBySchema(*refPkg)...)
		}
		if len(allAssetIDs) > 0 {
			assets, err := uc.Asset.FindByIDs(ctx, allAssetIDs, nil)
			if err == nil {
				assetsMap = assets.Map()
			}
		}
	}

	// Step 4: Build result from loaded data
	vi := make([]Item, 0, len(referencedItems))
	for _, ii := range referencedItems {
		refSchema := sp.SchemaByModel(ii.Value().Model())
		if refSchema == nil {
			continue
		}

		// Create a simple schema package for the referenced item
		refSchemaPackage := schema.NewPackage(refSchema, nil, nil, nil)

		var itemAssets asset.List
		if prp && assetsMap != nil {
			for _, aid := range ii.Value().AssetIDs() {
				if a, exists := assetsMap[aid]; exists {
					itemAssets = append(itemAssets, a)
				}
			}
		}

		vi = append(vi, NewItem(ii.Value(), refSchemaPackage, itemAssets, nil))
	}

	return vi
}
