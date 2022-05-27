package gcs

import (
	"context"
	"fmt"
	"github.com/go-playground/locales/id"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"net/url"
	"path"
)

const (
	gcsAssetBasePath string = "assets"
	fileSizeLimit    int64  = 1024 * 1024 * 100 // about 100MB
)

type file struct {
	bucket string
}

func NewFile(bucketName string, base string, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	var u *url.URL
	if base == "" {
		base = fmt.Sprintf("https://storage.googleapis.com/%s", bucketName)
	}

	var err error
	u, _ = url.Parse(base)
	if err != nil {
		return nil, errors.New("invalid base URL")
	}

	return &fileRepo{
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
	}, nil
}

type fileRepo struct {
	bucketName   string
	base         *url.URL
	cacheControl string
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

func getGCSObjectURL(base *url.URL, objectName string) *url.URL {
	if base == nil {
		return nil
	}

	b := *base
	b.Path = path.Join(b.Path, objectName)
	return &b
}
