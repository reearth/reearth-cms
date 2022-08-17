package gcp

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"strings"

	"cloud.google.com/go/storage"
	bufra "github.com/avvmoto/buf-readerat"
	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/appengine/log"
)

const (
	gcsAssetBasePath string = "assets"
	cacheSize               = 10 * 1024 * 1024
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

func (f *fileRepo) RandomReadAssetByURL(ctx context.Context, url *url.URL) (io.ReaderAt, int64, error) {
	objectName := getGCSObjectNameFromURL(f.base, url)
	return f.NewGCSReaderAt(ctx, objectName)
}

// helpers

func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

type GCSReaderAt struct {
	cache *bufra.BufReaderAt
}

func (f *fileRepo) UploadAsset(ctx context.Context, name string) (io.WriteCloser, error) {
	if name == "" {
		return nil, gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf(ctx, "gcs: upload bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	object := bucket.Object(name)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		log.Errorf(ctx, "gcs: upload delete err: %+v\n", err)
		return nil, gateway.ErrFailedToUploadFile
	}

	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl
	return writer, nil
}

func (f *fileRepo) NewGCSReaderAt(ctx context.Context, objectName string) (io.ReaderAt, int64, error) {
	rowReaderAt, size, err := f.newRawGCSReaderAt(ctx, objectName)
	if err != nil {
		log.Errorf(ctx, "gcs: rawGCSReaderAt err: %+v\n", err)
		return nil, 0, rerror.ErrInternalBy(err)
	}
	r := bufra.NewBufReaderAt(rowReaderAt, cacheSize)

	return &GCSReaderAt{
		cache: r,
	}, size, nil
}

func (g *GCSReaderAt) ReadAt(p []byte, off int64) (n int, err error) {
	return g.ReadAt(p, off)
}

type rawGCSReaderAt struct {
	ctx context.Context
	obj *storage.ObjectHandle
}

func (f *fileRepo) newRawGCSReaderAt(ctx context.Context, objectName string) (io.ReaderAt, int64, error) {
	if objectName == "" {
		return nil, 0, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf(ctx, "gcs: read bucket err: %+v\n", err)
		return nil, 0, rerror.ErrInternalBy(err)
	}
	obj := bucket.Object(objectName)
	attr, err := obj.Attrs(ctx)
	if err != nil {
		return nil, 0, err
	}
	size := attr.Size
	return &rawGCSReaderAt{ctx, obj}, size, nil
}

func (g *rawGCSReaderAt) ReadAt(b []byte, off int64) (n int, err error) {
	rc, err := g.obj.NewRangeReader(g.ctx, off, int64(len(b)))
	if err != nil {
		return
	}
	defer rc.Close()

	return rc.Read(b)
}

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf(ctx, "gcs: read bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	reader, err := bucket.Object(filename).NewReader(ctx)
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, rerror.ErrNotFound
		}
		log.Errorf(ctx, "gcs: read err: %+v\n", err)
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
		log.Errorf(ctx, "gcs: upload bucket err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	object := bucket.Object(filename)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		log.Errorf(ctx, "gcs: upload delete err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl

	if _, err := io.Copy(writer, content); err != nil {
		log.Errorf(ctx, "gcs: upload err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	if err := writer.Close(); err != nil {
		log.Errorf(ctx, "gcs: upload close err: %+v\n", err)
		return gateway.ErrFailedToUploadFile
	}

	return nil
}

func getGCSObjectNameFromURL(base, u *url.URL) string {
	if u == nil {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(u.Path, "/"))
	if p == "" || u.Host != base.Host || u.Scheme != base.Scheme || !strings.HasPrefix(p, gcsAssetBasePath+"/") {
		return ""
	}

	return p
}
