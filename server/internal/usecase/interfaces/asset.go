package interfaces

import (
	"context"
	"errors"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/id/idx"
)

type AssetFilterType string

const (
	AssetFilterDate AssetFilterType = "DATE"
	AssetFilterSize AssetFilterType = "SIZE"
	AssetFilterName AssetFilterType = "NAME"
)

type CreateAssetParam struct {
	ProjectID   idx.ID[id.Project]
	CreatedByID idx.ID[id.User]
	File        *file.File
}

type UpdateAssetParam struct {
	AssetID     idx.ID[id.Asset]
	PreviewType *asset.PreviewType
}

var (
	ErrCreateAssetFailed error = errors.New("failed to create asset")
)

type Asset interface {
	Fetch(context.Context, []id.AssetID, *usecase.Operator) ([]*asset.Asset, error)
	FindByID(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	FindByProject(context.Context, id.ProjectID, *string, *asset.SortType, *usecase.Pagination, *usecase.Operator) ([]*asset.Asset, *usecase.PageInfo, error)
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, error)
	Update(context.Context, UpdateAssetParam, *usecase.Operator) (*asset.Asset, error)
	Delete(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
}
