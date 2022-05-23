package interactor

import (
	"context"
	"path"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
	"google.golang.org/genproto/googleapis/cloud/asset/v1"
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

func (i *Asset) Create(ctx context.Context, input interfaces.CreateAssetParam, op *usecase.Operator) (*asset.Asset, error) {
	//TODO: ユーザーが書込み権限があるかチェック

	//TODO: 入力内容の不正をチェック

	//TODO: トランザくションを開始

	//TODO: ファイルをアップロード
	url, err := i.gateways.File.UploadAsset(ctx, inp.File)
	if err != nil {
		return nil, err
	}

	//TODO: domain層（Entity、pkg/asset)をインスタンス化
	// asset, err := new Asset()てきな
	result, err = asset.New().
		NewID().
		Team(inp.TeamID).
		Name(path.Base(inp.File.Path)).
		Size(inp.File.Size).
		URL(url.String()).
		Build()
	// TODO: インスタンス化したAssetを永続化・DBに保存

	return nil, nil
}
