package interactor

import (
	"context"
	"net/url"
	"path"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
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

func (i *Asset) FindByProject(ctx context.Context, pid id.ProjectID, keyword *string, sort *asset.SortType, p *usecase.Pagination, operator *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error) {
	return Run2(
		ctx, operator, i.repos,
		Usecase(),
		func() ([]*asset.Asset, *usecase.PageInfo, error) {
			return i.repos.Asset.FindByProject(ctx, pid, repo.AssetFilter{
				Sort:       sort,
				Keyword:    keyword,
				Pagination: p,
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
			url, err := i.gateways.File.UploadAsset(ctx, inp.File)
			if err != nil {
				return nil, err
			}

			a, err := asset.New().
				NewID().
				Project(inp.ProjectID).
				CreatedBy(inp.CreatedByID).
				FileName(path.Base(inp.File.Path)).
				Size(uint64(inp.File.Size)).
				Hash(url.String()).
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

func (i *Asset) Delete(ctx context.Context, aid id.AssetID, operator *usecase.Operator) (result id.AssetID, err error) {
	return Run1(
		ctx, operator, i.repos,
		Usecase().Transaction(),
		func() (id.AssetID, error) {
			asset, err := i.repos.Asset.FindByID(ctx, aid)
			if err != nil {
				return aid, err
			}

			if url, _ := url.Parse(asset.Hash()); url != nil {
				if err := i.gateways.File.DeleteAsset(ctx, url); err != nil {
					return aid, err
				}
			}

			return aid, i.repos.Asset.Delete(ctx, aid)
		},
	)
}
