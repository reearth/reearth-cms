package interfaces

import (
	"context"
	"io"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/model"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type AssetFilterType string

type ExportFormat string

const (
	ExportFormatJSON    ExportFormat = "json"
	ExportFormatGeoJSON ExportFormat = "geojson"
	ExportFormatCSV     ExportFormat = "csv"
)

type CreateAssetParam struct {
	ProjectID         idx.ID[id.Project]
	File              *file.File
	Token             string
	SkipDecompression bool
}

type UpdateAssetParam struct {
	AssetID     idx.ID[id.Asset]
	PreviewType *asset.PreviewType
}

type CreateAssetUploadParam struct {
	ProjectID idx.ID[id.Project]

	Filename        string
	ContentLength   int64
	ContentType     string
	ContentEncoding string

	Cursor string
}

type ExportModelToAssetsParam struct {
	Model      *model.Model
	Format     ExportFormat
	Pagination *usecasex.Pagination
}

var (
	ErrCreateAssetFailed            error = rerror.NewE(i18n.T("failed to create asset"))
	ErrFileNotIncluded              error = rerror.NewE(i18n.T("file not included"))
	ErrAssetUploadSizeLimitExceeded error = rerror.NewE(i18n.T("asset upload size limit exceeded"))
	ErrUnsupportedExportFormat      error = rerror.NewE(i18n.T("unsupported export format"))
)

type AssetFilter struct {
	Sort         *usecasex.Sort
	Keyword      *string
	Pagination   *usecasex.Pagination
	ContentTypes []string
}

type AssetUpload struct {
	URL             string
	UUID            string
	ContentType     string
	ContentLength   int64
	ContentEncoding string
	Next            string
}
type Asset interface {
	FindByID(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	FindByUUID(context.Context, string, *usecase.Operator) (*asset.Asset, error)
	FindByIDs(context.Context, []id.AssetID, *usecase.Operator) (asset.List, error)
	Search(context.Context, id.ProjectID, AssetFilter, *usecase.Operator) (asset.List, *usecasex.PageInfo, error)
	FindFileByID(context.Context, id.AssetID, *usecase.Operator) (*asset.File, error)
	FindFilesByIDs(context.Context, id.AssetIDList, *usecase.Operator) (map[id.AssetID]*asset.File, error)
	DownloadByID(context.Context, id.AssetID, map[string]string, *usecase.Operator) (io.ReadCloser, map[string]string, error)
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, *asset.File, error)
	Update(context.Context, UpdateAssetParam, *usecase.Operator) (*asset.Asset, error)
	UpdateFiles(context.Context, id.AssetID, *asset.ArchiveExtractionStatus, *usecase.Operator) (*asset.Asset, error)
	Delete(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
	BatchDelete(context.Context, id.AssetIDList, *usecase.Operator) ([]id.AssetID, error)
	Decompress(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	Publish(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	Unpublish(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	CreateUpload(context.Context, CreateAssetUploadParam, *usecase.Operator) (*AssetUpload, error)
	RetryDecompression(context.Context, string) error
	ExportModelToAssets(context.Context, ExportModelToAssetsParam, *usecase.Operator) (*asset.Asset, error)
}
