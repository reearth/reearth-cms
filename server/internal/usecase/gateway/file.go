package gateway

import (
	"context"
	"io"
	"mime"
	"path"
	"time"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

var (
	ErrInvalidFile          error = rerror.NewE(i18n.T("invalid file"))
	ErrFailedToUploadFile   error = rerror.NewE(i18n.T("failed to upload file"))
	ErrFileTooLarge         error = rerror.NewE(i18n.T("file too large"))
	ErrFailedToDeleteFile   error = rerror.NewE(i18n.T("failed to delete file"))
	ErrFileNotFound         error = rerror.NewE(i18n.T("file not found"))
	ErrUnsupportedOperation error = rerror.NewE(i18n.T("unsupported operation"))
)

type FileEntry struct {
	Name string
	Size int64
}

type UploadAssetLink struct {
	URL           string
	ContentType   string
	ContentLength int64
	Next          string
}

type IssueUploadAssetParam struct {
	UUID          string
	Filename      string
	ContentLength int64
	ExpiresAt     time.Time

	Cursor string
}

func init() {
	// mime package depends on the OS, so adding the requited mime types to make sure about the results in different OS
	lo.Must0(mime.AddExtensionType(".zip", "application/zip"))
	lo.Must0(mime.AddExtensionType(".7z", "application/x-7z-compressed"))
	lo.Must0(mime.AddExtensionType(".gz", "application/gzip"))
	lo.Must0(mime.AddExtensionType(".bz2", "application/x-bzip2"))
	lo.Must0(mime.AddExtensionType(".tar", "application/x-tar"))
	lo.Must0(mime.AddExtensionType(".rar", "application/vnd.rar"))
}

func (p IssueUploadAssetParam) ContentType() string {
	return mime.TypeByExtension(path.Ext(p.Filename))
}

type File interface {
	ReadAsset(context.Context, string, string) (io.ReadCloser, error)
	GetAssetFiles(context.Context, string) ([]FileEntry, error)
	UploadAsset(context.Context, *file.File) (string, int64, error)
	DeleteAsset(context.Context, string, string) error
	GetURL(*asset.Asset) string
	IssueUploadAssetLink(context.Context, IssueUploadAssetParam) (*UploadAssetLink, error)
	UploadedAsset(context.Context, *asset.Upload) (*file.File, error)
}
