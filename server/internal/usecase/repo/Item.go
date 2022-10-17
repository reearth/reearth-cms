package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
)

type Item interface {
	Filtered(ProjectFilter) Item
	FindByID(context.Context, id.ItemID) (*item.Item, error)
	FindBySchema(context.Context, id.SchemaID, id.ProjectID, *usecasex.Pagination) (item.List, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination) (item.List, *usecasex.PageInfo, error)
	FindByIDs(context.Context, id.ItemIDList) (item.List, error)
	FindAllVersionsByID(context.Context, id.ItemID, id.ProjectID) ([]*version.Value[*item.Item], error)
	Save(context.Context, *item.Item) error
	Remove(context.Context, id.ItemID, id.ProjectID) error
	Archive(context.Context, id.ItemID, bool) error
}
