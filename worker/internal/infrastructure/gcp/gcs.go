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

func (f *fileRepo) Read(ctx context.Context, path string) (gateway.ReadAtCloser, int64, error) {
	objectName := getGCSObjectNameFromURL(f.base, path)
	return f.NewGCSReaderAt(ctx, objectName)
}

// Upload is the function which allows this func's user to generate the function to upload asset to GCS dynamically
func (f *fileRepo) Upload(ctx context.Context, name string) (io.WriteCloser, error) {
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

// GCSReaderAt is a struct which implements io.ReadAt interface and internally it has buffer to prevent lot's of IO call
type GCSReaderAt struct {
	cache *bufra.BufReaderAt
}

func (f *fileRepo) NewGCSReaderAt(ctx context.Context, objectName string) (gateway.ReadAtCloser, int64, error) {
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
	return g.cache.ReadAt(p, off)
}

func (g *GCSReaderAt) Close() error {
	return nil
}

type rawGCSReaderAt struct {
	ctx context.Context
	obj *storage.ObjectHandle
}

// newRawGCSReaderAt implements io.ReadAt but calls IO a lot, should be wrapped by something which uses buffer
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

// helpers
func (f *fileRepo) bucket(ctx context.Context) (*storage.BucketHandle, error) {
	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, err
	}
	bucket := client.Bucket(f.bucketName)
	return bucket, nil
}

func getGCSObjectNameFromURL(base *url.URL, path string) string {
	if path == "" {
		return ""
	}
	if base == nil {
		base = &url.URL{}
	}
	p := sanitize.Path(strings.TrimPrefix(path, "/"))
	if p == "" || !strings.HasPrefix(p, gcsAssetBasePath+"/") {
		return ""
	}

	return p
}
