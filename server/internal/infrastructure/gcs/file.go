package gcs

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strings"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
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

func (f *fileRepo) ReadAsset(ctx context.Context, name string) (io.ReadCloser, error) {
	sn := sanitize.Path(name)
	if sn == "" {
		return nil, rerror.ErrNotFound
	}
	return f.read(ctx, path.Join(gcsAssetBasePath, sn))
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
	if file == nil {
		return nil, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return nil, gateway.ErrFileTooLarge
	}

	uuid := newUUID()
	p := path.Join(uuid[:2], uuid[2:], file.Path)
	snp := sanitize.Path(p)
	if snp == "" {
		return nil, gateway.ErrInvalidFile
	}

	u := getGCSObjectURL(f.base, snp)
	if u == nil {
		return nil, gateway.ErrInvalidFile
	}

	if err := f.upload(ctx, snp, file.Content); err != nil {
		return nil, err
	}
	return u, nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u *url.URL) error {
	sn := getGCSObjectNameFromURL(f.base, u)
	if sn == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, sn)
}

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: read bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	reader, err := bucket.Object(filename).NewReader(ctx)
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, rerror.ErrNotFound
		}
		log.Errorf("gcs: read err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	return reader, nil
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

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: delete bucket err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	object := bucket.Object(filename)
	if err := object.Delete(ctx); err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil
		}

		log.Errorf("gcs: delete err: %+v\n", err)
		return rerror.ErrInternalBy(err)
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

func getGCSObjectNameFromURL(base, u *url.URL) string {
	if u == nil {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(u.Path, "/"))
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme {
		return ""
	}

	return p
}

func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

func newUUID() string {
	return uuid.New().String()
}
