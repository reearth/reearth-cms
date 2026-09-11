package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/usecasex"
)

type AssetFilter struct {
	Sort         *usecasex.Sort
	Keyword      *string
	Pagination   *usecasex.Pagination
	ContentTypes []string
}

type Asset interface {
	Filtered(ProjectFilter) Asset
	FindByID(context.Context, id.AssetID) (*asset.Asset, error)
	FindByUUID(context.Context, string) (*asset.Asset, error)
	FindByIDs(context.Context, id.AssetIDList) (asset.List, error)
	Search(context.Context, id.ProjectID, AssetFilter) (asset.List, *usecasex.PageInfo, error)
	Save(context.Context, *asset.Asset) error
	Delete(context.Context, id.AssetID) error
	BatchDelete(context.Context, id.AssetIDList) error
}

type AssetFile interface {
	FindByID(context.Context, id.AssetID) (*asset.File, error)
	FindByIDs(context.Context, id.AssetIDList) (map[id.AssetID]*asset.File, error)
	Save(context.Context, id.AssetID, *asset.File) error
	// SaveFlatFiles writes the flattened file list to storage without
	// flipping the parent asset's flatfiles pointer, so a large write can
	// run outside a transaction while CommitFlatFiles stays small enough
	// to run inside one.
	SaveFlatFiles(context.Context, id.AssetID, []*asset.File) error
	// CommitFlatFiles flips the parent asset document to point at the files
	// most recently written by SaveFlatFiles. Cheap and safe to run inside
	// a transaction alongside other asset writes.
	CommitFlatFiles(context.Context, id.AssetID, *asset.File) error
}
