package repo

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearthx/usecasex"
)

type FieldAndValue struct {
	Field schema.FieldID
	Value *value.Multiple
}

type Item interface {
	Filtered(ProjectFilter) Item
	FindByID(context.Context, id.ItemID) (item.Versioned, error)
	FindBySchema(context.Context, id.SchemaID, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	FindByProject(context.Context, id.ProjectID, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	Search(context.Context, *item.Query, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	FindByIDs(context.Context, id.ItemIDList) (item.VersionedList, error)
	FindAllVersionsByID(context.Context, id.ItemID) (item.VersionedList, error)
	IsArchived(context.Context, id.ItemID) (bool, error)
	FindByModelAndValue(context.Context, id.ModelID, []FieldAndValue) (item.VersionedList, error)
	Save(context.Context, *item.Item) error
	Remove(context.Context, id.ItemID) error
	Archive(context.Context, id.ItemID, id.ProjectID, bool) error
}
