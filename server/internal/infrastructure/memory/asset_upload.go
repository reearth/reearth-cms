package memory

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase/repo"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/util"
)

type AssetUpload struct {
	data *util.SyncMap[string, *asset.Upload]
}

var _ repo.AssetUpload = (*AssetUpload)(nil)

func NewAssetUpload() *AssetUpload {
	return &AssetUpload{data: &util.SyncMap[string, *asset.Upload]{}}
}

func (r *AssetUpload) Save(_ context.Context, u *asset.Upload) error {
	r.data.Store(u.UUID(), u.Clone())
	return nil
}

func (r *AssetUpload) FindByID(_ context.Context, uuid string) (*asset.Upload, error) {
	u, ok := r.data.Load(uuid)
	if !ok {
		return nil, rerror.ErrNotFound
	}
	return u.Clone(), nil
}
