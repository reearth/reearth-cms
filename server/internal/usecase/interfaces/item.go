package interfaces

import (
	"context"
	"io"
	"strings"
	"time"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/integrationapi"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearth-cms/server/pkg/version"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

var (
	ErrItemFieldRequired        = rerror.NewE(i18n.T("item field required"))
	ErrInvalidField             = rerror.NewE(i18n.T("invalid field"))
	ErrDuplicatedItemValue      = rerror.NewE(i18n.T("duplicated value"))
	ErrFieldValueExist          = rerror.NewE(i18n.T("field value exist"))
	ErrItemsShouldBeOnSameModel = rerror.NewE(i18n.T("items should be on the same model"))
	ErrItemMissing              = rerror.NewE(i18n.T("one or more items not found"))
	ErrItemConflicted           = rerror.NewE(i18n.T("item has been changed before you change it"))
	ErrMetadataMismatch         = rerror.NewE(i18n.T("metadata item and schema mismatch"))
)

type ItemFieldParam struct {
	Field *item.FieldID
	Key   *id.Key
	// Type  value.Type
	Value any
	Group *id.ItemGroupID
}

type CreateItemParam struct {
	SchemaID   schema.ID
	ModelID    model.ID
	MetadataID *item.ID
	Fields     []ItemFieldParam
}

type UpdateItemParam struct {
	ItemID     item.ID
	MetadataID *item.ID
	Fields     []ItemFieldParam
	Version    *version.Version
}

type ImportFormatType string

const (
	ImportFormatTypeGeoJSON ImportFormatType = "geoJson"
	ImportFormatTypeJSON    ImportFormatType = "json"
)

func ImportFormatTypeFromString(s string) ImportFormatType {
	switch strings.ToLower(s) {
	case "geojson":
		return ImportFormatTypeGeoJSON
	case "json":
		return ImportFormatTypeJSON
	default:
		return ""
	}
}

type ImportStrategyType string

const (
	ImportStrategyTypeInsert ImportStrategyType = "insert"
	ImportStrategyTypeUpdate ImportStrategyType = "update"
	ImportStrategyTypeUpsert ImportStrategyType = "upsert"
)

func ImportStrategyTypeFromString(s string) ImportStrategyType {
	switch s {
	case "insert":
		return ImportStrategyTypeInsert
	case "update":
		return ImportStrategyTypeUpdate
	case "upsert":
		return ImportStrategyTypeUpsert
	default:
		return ""
	}
}

type ImportItemParam struct {
	ItemId     *id.ItemID
	MetadataID *item.ID
	Fields     []ItemFieldParam
}

type ImportItemsParam struct {
	ModelID      id.ModelID
	SP           schema.Package
	Strategy     ImportStrategyType
	Format       ImportFormatType
	MutateSchema bool
	Reader       io.Reader
	GeoField     *string // field key or id
}

type ImportItemsResponse struct {
	Total     int
	Inserted  int
	Updated   int
	Ignored   int
	NewFields schema.FieldList
}

// ExportItemsToCSVResponse contains exported csv data from items
type ExportItemsToCSVResponse struct {
	PipeReader *io.PipeReader
}

type ExportItemsToGeoJSONResponse struct {
	FeatureCollections *integrationapi.FeatureCollection
}

type Item interface {
	FindByID(context.Context, id.ItemID, *usecase.Operator) (item.Versioned, error)
	FindPublicByID(context.Context, id.ItemID, *usecase.Operator) (item.Versioned, error)
	FindByIDs(context.Context, id.ItemIDList, *usecase.Operator) (item.VersionedList, error)
	FindByAssets(context.Context, id.AssetIDList, *usecase.Operator) (map[id.AssetID]item.VersionedList, error)
	FindBySchema(context.Context, id.SchemaID, *usecasex.Sort, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindPublicByModel(context.Context, id.ModelID, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	FindVersionByID(context.Context, id.ItemID, version.VersionOrRef, *usecase.Operator) (item.Versioned, error)
	FindAllVersionsByID(context.Context, id.ItemID, *usecase.Operator) (item.VersionedList, error)
	Search(context.Context, schema.Package, *item.Query, *usecasex.Pagination, *usecase.Operator) (item.VersionedList, *usecasex.PageInfo, error)
	ItemStatus(context.Context, id.ItemIDList, *usecase.Operator) (map[id.ItemID]item.Status, error)
	LastModifiedByModel(context.Context, id.ModelID, *usecase.Operator) (time.Time, error)
	IsItemReferenced(context.Context, id.ItemID, id.FieldID, *usecase.Operator) (bool, error)
	Create(context.Context, CreateItemParam, *usecase.Operator) (item.Versioned, error)
	Update(context.Context, UpdateItemParam, *usecase.Operator) (item.Versioned, error)
	Delete(context.Context, id.ItemID, *usecase.Operator) error
	Publish(context.Context, id.ItemIDList, *usecase.Operator) (item.VersionedList, error)
	Unpublish(context.Context, id.ItemIDList, *usecase.Operator) (item.VersionedList, error)
	Import(context.Context, ImportItemsParam, *usecase.Operator) (ImportItemsResponse, error)
	TriggerImportJob(context.Context, id.AssetID, id.ModelID, string, string, string, bool, *usecase.Operator) error
	// ItemsAsCSV exports items data in content to csv file by schema package.
	ItemsAsCSV(context.Context, *schema.Package, *int, *int, *usecase.Operator) (ExportItemsToCSVResponse, error)
	// ItemsAsGeoJSON converts items to Geo JSON type given thge schema package.
	ItemsAsGeoJSON(context.Context, *schema.Package, *int, *int, *usecase.Operator) (ExportItemsToGeoJSONResponse, error)
}
