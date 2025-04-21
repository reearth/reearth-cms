package gateway

import (
	"context"
	"errors"
	"io"
)

var (
	ErrInvalidFile        = errors.New("invalid file")
	ErrNotFound           = errors.New("not found")
	ErrFailedToUploadFile = errors.New("failed to upload file")
	ErrFileTooLarge       = errors.New("file too large")
	ErrFailedToRemoveFile = errors.New("failed to remove file")
)

type ReadAtCloser interface {
	io.ReaderAt
	io.Closer
}

type File interface {
	Read(ctx context.Context, path string) (ReadAtCloser, int64, int64, error)
	WriteProceeded(ctx context.Context, path string, proceeded int64) error
	Upload(ctx context.Context, name string) (io.WriteCloser, error)
}
