package gateway

import (
	"context"
	"errors"
	"io"
	"net/url"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrNotFound           error = errors.New("not found")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	// ReadAsset(ctx context.Context, name string) (io.ReadCloser, error)
	RandomReadAssetByURL(ctx context.Context, url *url.URL) (io.ReaderAt, int64, error)
	// UploadAsset(context.Context, *file.File) (*url.URL, error)
}
