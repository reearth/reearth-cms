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
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

func (c *Controller) GetItem(ctx context.Context, wAlias, pAlias, mKey, iID string) (Item, error) {
	wpm, err := c.loadWPMContext(ctx, wAlias, pAlias, mKey)
	if err != nil {
		return Item{}, err
	}

	if mKey == "" {
		return Item{}, rerror.ErrNotFound
	}

	iid, err := id.ItemIDFrom(iID)
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
			IncloudRefModels: wpm.PublicModels,
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

	var vi []Item
	for _, f := range i.Fields().FieldsByType(value.TypeReference) {
		for _, v := range f.Value().Values() {
			iid, ok := v.Value().(id.ItemID)
			if !ok {
				continue
			}
			ii, err := uc.Item.FindByID(ctx, iid, op)
			if err != nil || ii == nil {
				continue
			}
			sp, err := uc.Schema.FindByModel(ctx, ii.Value().Model(), op)
			if err != nil {
				continue
			}
			var assets asset.List
			if prp {
				assets, err = uc.Asset.FindByIDs(ctx, ii.Value().AssetIDs(), nil)
				if err != nil {
					continue
				}
			}
			vi = append(vi, NewItem(ii.Value(), sp, assets, nil))
		}
	}

	return vi
}
