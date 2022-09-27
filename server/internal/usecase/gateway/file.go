package gateway

import (
	"context"
	"errors"
	"io"

	"github.com/reearth/reearth-cms/server/pkg/file"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToDeleteFile error = errors.New("failed to delete file")
)

type File interface {
	ReadAsset(context.Context, string, string) (io.ReadCloser, error)
	UploadAsset(context.Context, *file.File) (string, error)
	DeleteAsset(context.Context, string, string) error
}
