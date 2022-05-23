package gql

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

//MEMO: controller的なやつで、gql -> usecaseの入力の変換と呼び出しをする
func (r *mutationResolver) CreateAsset(ctx context.Context, input *gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPyload, error) {
	// TODO: 入力からチームのIDなどを取得する

	//TODO: usecase層(interactor/asset.go)のcreateを呼び出す
	a, err := interfaces.Asset.Create(ctx, hoge, hoge)
	if err != nil {
		return nil, err //エラーハンドリングする
	}
	return &gqlmodel.CreateAssetPyload{
		Asset: &gqlmodel.Asset{
			ID: "hogehoge",
		},
	}, nil
}
