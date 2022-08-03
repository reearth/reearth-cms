package gateway

import (
	"context"
	"errors"
	"io"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	ReadAsset(context.Context, string) (io.ReadCloser, error)
	// UploadAsset(context.Context, *file.File) (*url.URL, error)
}
