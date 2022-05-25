package gql

import (
	"context"
	"github.com/reearth/reearth-cms/server/pkg/id"

	"github.com/reearth/reearth-cms/server/internal/adapter/gql/gqlmodel"
	"github.com/reearth/reearth-cms/server/internal/usecase/interfaces"
)

//MEMO: controller的なやつで、gql -> usecaseの入力の変換と呼び出しをする
func (r *mutationResolver) CreateAsset(ctx context.Context, input *gqlmodel.CreateAssetInput) (*gqlmodel.CreateAssetPyload, error) {

	res, err := interfaces.Asset.Create(ctx, interfaces.CreateAssetParam{
		TeamID: id.TeamID(input.TeamID),
		File:   gqlmodel.FromFile(&input.File)
	})
	if err != nil {
		return nil, err //エラーハンドリングする
	}
	return &gqlmodel.CreateAssetPyload{Asset: gqlmodel.ToAsset(res)}, nil
}
