package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
)

type AssetFilter struct {
	Sort       *asset.SortType
	Keyword    *string
	Pagination *usecase.Pagination
}

type Asset interface {
	Filtered(WorkspaceFilter) Asset
	FindByProject(context.Context, id.Project, AssetFilter) ([]*asset.Asset, *usecase.PageInfo, error)
	FindByID(context.Context, id.AssetID) (*asset.Asset, error)
	FindByIDs(context.Context, id.AssetIDList) ([]*asset.Asset, error)
	Save(context.Context, *asset.Asset) error
	Remove(context.Context, id.AssetID) error
}
