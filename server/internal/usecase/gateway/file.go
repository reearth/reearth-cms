package gateway

import (
	"context"
	"io"
	"net/url"
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
