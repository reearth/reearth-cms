package zip

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"

	"cloud.google.com/go/storage"
	bufra "github.com/avvmoto/buf-readerat"
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

func NewFile(bucketName, base string, cacheControl string) (*fileRepo, error) {
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

// func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
// 	if file == nil {
// 		return nil, gateway.ErrInvalidFile
// 	}
// 	if file.Size >= fileSizeLimit {
// 		return nil, gateway.ErrFileTooLarge
// 	}

// 	sn := sanitize.Path("hoge" + path.Ext(file.Path))
// 	if sn == "" {
// 		return nil, gateway.ErrInvalidFile
// 	}

// 	filename := path.Join(gcsAssetBasePath, sn)
// 	u := getGCSObjectURL(f.base, filename)
// 	if u == nil {
// 		return nil, gateway.ErrInvalidFile
// 	}

// 	if err := f.upload(ctx, filename, file.Content); err != nil {
// 		return nil, err
// 	}
// 	return u, nil
// }

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

func (f *fileRepo) UploadFunc(ctx context.Context, name string) (io.WriteCloser, error) {
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

func (f *fileRepo) NewGCSReaderAt(ctx context.Context, objectName string) (io.ReaderAt, error) {
	rowReaderAt, err := f.newRawGCSReaderAt(ctx, objectName)
	if err != nil {
		log.Errorf(ctx, "gcs: rawGCSReaderAt err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}
	r := bufra.NewBufReaderAt(rowReaderAt, cacheSize)

	return &GCSReaderAt{
		cache: r,
	}, nil
}

func (g *GCSReaderAt) ReadAt(p []byte, off int64) (n int, err error) {
	return g.ReadAt(p, off)
}

type rawGCSReaderAt struct {
	ctx context.Context
	obj *storage.ObjectHandle
}

func (f *fileRepo) newRawGCSReaderAt(ctx context.Context, objectName string) (io.ReaderAt, error) {
	if objectName == "" {
		return nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf(ctx, "gcs: read bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}
	obj := bucket.Object(objectName)
	return &rawGCSReaderAt{ctx, obj}, nil
}

func (g *rawGCSReaderAt) ReadAt(b []byte, off int64) (n int, err error) {
	rc, err := g.obj.NewRangeReader(g.ctx, off, int64(len(b)))
	if err != nil {
		return
	}
	defer rc.Close()

	return rc.Read(b)
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
