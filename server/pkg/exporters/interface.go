package exporters

import (
	"context"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/item"
	"github.com/reearth/reearth-cms/server/pkg/schema"
	"github.com/reearth/reearthx/usecasex"
)

type ExportFormat string

const (
	FormatJSON    ExportFormat = "json"
	FormatGeoJSON ExportFormat = "geojson"
	FormatCSV     ExportFormat = "csv"
)

type ItemLoader func(list id.ItemIDList) (item.List, error)

type AssetLoader func(assetIDs id.AssetIDList) (asset.List, error)

type ExportRequest struct {
	Format      ExportFormat
	ModelID     id.ModelID
	Schema      schema.Package
	Options     ExportOptions
	ItemLoader  ItemLoader
	AssetLoader AssetLoader
}

// ExportOptions contains format-specific options
type ExportOptions struct {
	PublicOnly       bool
	IncludeAssets    bool
	IncludeGeometry  bool
	GeometryField    *schema.FieldID
	Pagination       *usecasex.Pagination
	IncludeRefModels id.ModelIDList
}

// Exporter defines the interface for all export implementations
type Exporter interface {
	ValidateRequest(*ExportRequest) error
	Export(context.Context, *ExportRequest, item.List, asset.List) error
	StartExport(context.Context, *ExportRequest) error
	ProcessBatch(context.Context, item.List, asset.List) error
	EndExport(context.Context, map[string]any) error
}
