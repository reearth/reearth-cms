package gcs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"

	"cloud.google.com/go/storage"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/log"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
)

const (
	gcsAssetBasePath string = "assets"
	fileSizeLimit    int64  = 1024 * 1024 * 100 // about 100MB
)

type fileRepo struct {
	bucketName   string
	base         *url.URL
	cacheControl string
}

func NewFile(bucketName, base string, cacheControl string) (gateway.File, error) {
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

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
	if file == nil {
		return nil, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return nil, gateway.ErrFileTooLarge
	}

	sn := sanitize.Path(newAssetID() + path.Ext(file.Path))
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

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: upload bucket err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	object := bucket.Object(filename)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		log.Errorf("gcs: upload delete err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl

	if _, err := io.Copy(writer, content); err != nil {
		log.Errorf("gcs: upload err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	if err := writer.Close(); err != nil {
		log.Errorf("gcs: upload close err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	return nil
}

func getGCSObjectURL(base *url.URL, objectName string) *url.URL {
	if base == nil {
		return nil
	}

	b := *base
	b.Path = path.Join(b.Path, objectName)
	return &b
}

func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}
