package gateway

import (
	"context"
	"errors"
	"net/url"

	"github.com/reearth/reearth-cms/server/pkg/file"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	UploadAsset(context.Context, *file.File) (*url.URL, error)
	RemoveAsset(context.Context, *url.URL) error
}
