package gateway

import (
	"context"
	"errors"
	"io"
	"net/url"
)

var (
	ErrInvalidFile        error = errors.New("invalid file")
	ErrFailedToUploadFile error = errors.New("failed to upload file")
	ErrFileTooLarge       error = errors.New("file too large")
	ErrFailedToRemoveFile error = errors.New("failed to remove file")
)

type File interface {
	UploadAsset(ctx context.Context, *FileData) (*url.URL, error)
}

type FileData struct {
	Content     io.ReadCloser
	Path        string
	Size        int64
	ContentType string
}
