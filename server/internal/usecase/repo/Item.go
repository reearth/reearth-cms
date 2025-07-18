package repo

import (
	"context"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/value"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/usecasex"
)

type FieldAndValue struct {
	Field schema.FieldID
	Value *value.Multiple
}

type CopyParams struct {
	OldSchema   id.SchemaID
	NewSchema   id.SchemaID
	NewModel    id.ModelID
	Timestamp   time.Time
	User        *string
	Integration *string
}

type Item interface {
	Filtered(ProjectFilter) Item
	FindByID(context.Context, id.ItemID, *version.Ref) (item.Versioned, error)
	FindByIDs(context.Context, id.ItemIDList, *version.Ref) (item.VersionedList, error)
	FindBySchema(context.Context, id.SchemaID, *version.Ref, *usecasex.Sort, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	FindByModel(context.Context, id.ModelID, *version.Ref, *usecasex.Sort, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	FindByAssets(context.Context, id.AssetIDList, *version.Ref) (item.VersionedList, error)
	LastModifiedByModel(context.Context, id.ModelID) (time.Time, error)
	Search(context.Context, schema.Package, *item.Query, *usecasex.Pagination) (item.VersionedList, *usecasex.PageInfo, error)
	FindVersionByID(context.Context, id.ItemID, version.VersionOrRef) (item.Versioned, error)
	FindAllVersionsByID(context.Context, id.ItemID) (item.VersionedList, error)
	FindAllVersionsByIDs(context.Context, id.ItemIDList) (item.VersionedList, error)
	FindByModelAndValue(context.Context, id.ModelID, []FieldAndValue, *version.Ref) (item.VersionedList, error)
	CountByModel(context.Context, id.ModelID) (int, error)
	IsArchived(context.Context, id.ItemID) (bool, error)
	Save(context.Context, *item.Item) error
	SaveAll(context.Context, item.List) error
	UpdateRef(context.Context, id.ItemID, version.Ref, *version.VersionOrRef) error
	Remove(context.Context, id.ItemID) error
	Archive(context.Context, id.ItemID, id.ProjectID, bool) error
	Copy(context.Context, CopyParams) (*string, *string, error)
}
