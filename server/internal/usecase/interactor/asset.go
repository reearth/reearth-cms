package interactor

import (
	"context"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"path"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

type Asset struct {
	repos    *repo.Asset
	gateways *gateway.File
	// repos    *repo.Container
	// gateways *gateway.Container
}

func NewAsset(r *repo.Asset, g *gateway.File) interfaces.Asset {
	return &Asset{
		repos:    r,
		gateways: g,
	}
}

func (i *Asset) Create(ctx context.Context, inp interfaces.CreateAssetParam, op *usecase.Operator) (*asset.Asset, error) {
	if err := i.CanWriteTeam(inp.TeamID, operator); err != nil {
		return nil, err
	}

	if inp.File == nil {
		return nil, interfaces.ErrFileNotIncluded
	}

	tx, err := i.repos.Transaction.Begin()
	if err != nil {
		return
	}
	defer func() {
		if err2 := tx.End(ctx); err == nil && err2 != nil {
			err = err2
		}
	}()

	url, err := i.gateways.File.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, err
	}

	result, err = asset.New().
		NewID().
		Team(inp.TeamID).
		Name(path.Base(inp.File.Path)).
		Size(inp.File.Size).
		URL(url.String()).
		Build()

	if err = i.repos.Asset.Save(ctx, result); err != nil {
		return
	}

	tx.Commit()

	return
}
