package interactor

import (
	"context"
	"path"
	"strings"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type Asset struct {
	repos    *repo.Container
	gateways *gateway.Container
}

func NewAsset(r *repo.Container, g *gateway.Container) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
	}
}

func (i *Asset) Fetch(ctx context.Context, assets []id.AssetID, operator *usecase.Operator) ([]*asset.Asset, error) {
	return i.repos.Asset.FindByIDs(ctx, assets)
}

func (i *Asset) FindByID(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (*asset.Asset, error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			return i.repos.Asset.FindByID(ctx, aid)
		},
	)
}

func (i *Asset) FindByProject(ctx context.Context, pid id.ProjectID, f interfaces.AssetFilter, o *usecase.Operator) ([]*asset.Asset, *usecasex.PageInfo, error) {
	return Run2(
		ctx, o, i.repos,
		Usecase().Transaction(),
		func() ([]*asset.Asset, *usecasex.PageInfo, error) {
			return i.repos.Asset.FindByProject(ctx, pid, repo.AssetFilter{
				Sort:       f.Sort,
				Keyword:    f.Keyword,
				Pagination: f.Pagination,
			})
		},
	)
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			uuid, err := i.gateways.File.UploadAsset(ctx, inp.File)
			if err != nil {
				return nil, err
			}

			f := &asset.File{}
			f.SetName(inp.File.Path)
			f.SetSize(uint64(inp.File.Size))
			f.SetContentType(inp.File.ContentType)

			var t asset.PreviewType
			if strings.HasPrefix(inp.File.ContentType, "image/") {
				t = asset.PreviewTypeIMAGE
			} else {
				t = asset.PreviewTypeGEO
			}

			a, err := asset.New().
				NewID().
				Project(inp.ProjectID).
				CreatedBy(inp.CreatedByID).
				FileName(path.Base(inp.File.Path)).
				Size(uint64(inp.File.Size)).
				File(f).
				Type(&t).
				UUID(uuid).
				Build()
			if err != nil {
				return nil, err
			}

			if err := i.repos.Asset.Save(ctx, a); err != nil {
				return nil, err
			}

			return a, nil
		})
}

func (i *Asset) Update(ctx context.Context, inp interfaces.UpdateAssetParam, operator *usecase.Operator) (result *asset.Asset, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (*asset.Asset, error) {
			asset, err := i.repos.Asset.FindByID(ctx, inp.AssetID)
			if err != nil {
				return nil, err
			}

			if inp.PreviewType != nil {
				asset.UpdatePreviewType(inp.PreviewType)
			}

			err2 := i.repos.Asset.Update(ctx, asset)
			return asset, err2
		},
	)
}

func (i *Asset) Delete(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (id.AssetID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, err
			}

			uuid := asset.UUID()
			filename := asset.FileName()
			if uuid != "" && filename != "" {
				if err := i.gateways.File.DeleteAsset(ctx, uuid, filename); err != nil {
					return aid, err
				}
			}

			return aid, i.repos.Asset.Delete(ctx, aid)
		},
	)
}
