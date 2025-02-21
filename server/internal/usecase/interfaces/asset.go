package interfaces

import (
	"context"
	"io"

	"github.com/reearth/reearth-cms/server/internal/usecase"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/idx"
	"github.com/reearth/reearthx/rerror"
	"github.com/reearth/reearthx/usecasex"
)

type AssetFilterType string

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

var (
	ErrCreateAssetFailed error = rerror.NewE(i18n.T("failed to create asset"))
	ErrFileNotIncluded   error = rerror.NewE(i18n.T("file not included"))
)

type AssetFilter struct {
	Sort       *usecasex.Sort
	Keyword    *string
	Pagination *usecasex.Pagination
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
	FindByIDs(context.Context, []id.AssetID, *usecase.Operator) (asset.List, error)
	FindByProject(context.Context, id.ProjectID, AssetFilter, *usecase.Operator) (asset.List, *usecasex.PageInfo, error)
	FindFileByID(context.Context, id.AssetID, *usecase.Operator) (*asset.File, error)
	FindFilesByIDs(context.Context, id.AssetIDList, *usecase.Operator) (map[id.AssetID]*asset.File, error)
	DownloadByID(context.Context, id.AssetID, map[string]string, *usecase.Operator) (io.ReadCloser, map[string]string, error)
	GetURL(*asset.Asset) string
	Create(context.Context, CreateAssetParam, *usecase.Operator) (*asset.Asset, *asset.File, error)
	Update(context.Context, UpdateAssetParam, *usecase.Operator) (*asset.Asset, error)
	UpdateFiles(context.Context, id.AssetID, *asset.ArchiveExtractionStatus, *usecase.Operator) (*asset.Asset, error)
	Delete(context.Context, id.AssetID, *usecase.Operator) (id.AssetID, error)
	// BatchDelete deletes assets in batch based on multiple asset IDs
	BatchDelete(context.Context, id.AssetIDList, *usecase.Operator) ([]id.AssetID, error)
	DecompressByID(context.Context, id.AssetID, *usecase.Operator) (*asset.Asset, error)
	CreateUpload(context.Context, CreateAssetUploadParam, *usecase.Operator) (*AssetUpload, error)
	RetryDecompression(context.Context, string) error
}
