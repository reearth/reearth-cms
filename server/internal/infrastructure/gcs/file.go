package gcs

import (
	"context"
	"net/url"
	"path"

	"github.com/go-playground/locales/id"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
)

type file struct {
	bucket string
}

func NewFile(bucket string) gateway.File {
	return &file{
		bucket: bucket,
	}
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
	if file == nil {
		return nil, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return nil, gateway.ErrFileTooLarge
	}

	sn := sanitize.Path(id.New().String() + path.Ext(file.Path))
	if sn == "" {
		return nil, gateway.ErrInvalidFile
	}

	filename := path.Join(gcsAssetBasePath, sn)
	u := getGCSObjectURL(f.base, filename)
	if u == nil {
		return nil, gateway.ErrInvalidFile
	}

	if err := f.upload(ctx, filename, file.Content); err != nil {
		return nil, err
	}
	return u, nil

}
