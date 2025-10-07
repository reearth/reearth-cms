package publicapi

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

func (c *Controller) GetAsset(ctx context.Context, prj, i string) (Asset, error) {
	wpm, err := c.loadWPMContext(ctx, "", prj, "")
	if err != nil {
		return Asset{}, err
	}

	if !wpm.PublicAssets {
		return Asset{}, rerror.ErrNotFound
	}

	iid, err := id.AssetIDFrom(i)
	if err != nil {
		return Asset{}, rerror.ErrNotFound
	}

	a, err := c.usecases.Asset.FindByID(ctx, iid, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return Asset{}, rerror.ErrNotFound
		}
		return Asset{}, err
	}

	f, err := c.usecases.Asset.FindFileByID(ctx, iid, nil)
	if err != nil {
		return Asset{}, err
	}

	return NewAsset(a, f), nil
}

func (c *Controller) GetAssets(ctx context.Context, wsAlias, pAlias string, p *usecasex.Pagination, w io.Writer) error {
	wpm, err := c.loadWPMContext(ctx, wsAlias, pAlias, "")
	if err != nil {
		return err
	}

	if !wpm.PublicAssets {
		return rerror.ErrNotFound
	}

	err = c.usecases.Asset.Export(ctx, interfaces.ExportAssetsParams{
		ProjectID: wpm.Project.ID(),
		Filter: interfaces.AssetFilter{
			Sort:         nil,
			Keyword:      nil,
			Pagination:   p,
			ContentTypes: nil,
		},
		IncludeFiles: true,
	}, w, nil)
	if err != nil {
		if errors.Is(err, rerror.ErrNotFound) {
			return rerror.ErrNotFound
		}
		return err
	}

	return nil
}
