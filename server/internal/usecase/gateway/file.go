package gateway

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToDeleteFile error = errors.New("failed to delete file")
	ErrFileNotFound       error = errors.New("file not found")
)

type FileEntry struct {
	Name string
	Size int64
}

type File interface {
	ReadAsset(context.Context, string, string) (io.ReadCloser, error)
	GetAssetFiles(context.Context, string) ([]FileEntry, error)
	UploadAsset(context.Context, *file.File) (string, int64, error)
	DeleteAsset(context.Context, string, string) error
	GetURL(*asset.Asset) string
}
