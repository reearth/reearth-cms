package gcp

import (
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"

	"cloud.google.com/go/storage"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/pkg/rangereader"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
)

const (
	gcsAssetBasePath string = "assets"

	metadataProceeded = "proceeded"
	metadataAttempts  = "attempts"
)

type contextKey string

const workspaceContextKey contextKey = "workspace"

type fileRepo struct {
	bucketName     string
	cacheControl   string
	maxArchiveSize int64
	bucket         *storage.BucketHandle
}

type FileOption func(*fileRepo)

// WithMaxArchiveSize makes Read reject archives larger than n bytes with
// gateway.ErrFileTooLarge. n <= 0 disables the check.
func WithMaxArchiveSize(n int64) FileOption {
	return func(f *fileRepo) {
		f.maxArchiveSize = n
	}
}

func NewFile(bucketName string, cacheControl string, opts ...FileOption) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	f := &fileRepo{
		bucketName:   bucketName,
		cacheControl: cacheControl,
	}
	for _, o := range opts {
		o(f)
	}
	return f, nil
}

// Read returns a bounded-memory io.ReaderAt over the archive object. The
// object is read with ranged requests (see rangereader), so memory use does
// not depend on the archive size, and every ranged reader is closed after use.
func (f *fileRepo) Read(ctx context.Context, path string) (gateway.ReadAtCloser, int64, int64, error) {
	if path == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}
	objectName := getGCSObjectNameFromURL(gcsAssetBasePath, path)
	return f.openRangeReader(ctx, objectName)
}

func (f *fileRepo) Upload(ctx context.Context, name string) (io.WriteCloser, error) {
	if name == "" {
		return nil, gateway.ErrInvalidFile
	}

	bucket, err := f.getBucket(ctx)
	if err != nil {
		log.Errorf("gcs: upload bucket err: %+v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	name = path.Join(gcsAssetBasePath, name)

	object := bucket.Retryer(storage.WithPolicy(storage.RetryAlways)).Object(name)
	writer := object.NewWriter(ctx)
	writer.CacheControl = f.cacheControl

	if workspace := getWorkspaceFromContext(ctx); workspace != "" {
		if writer.Metadata == nil {
			writer.Metadata = make(map[string]string)
		}
		writer.Metadata["X-Reearth-Workspace-ID"] = workspace
	}

	return writer, nil
}

func (f *fileRepo) WriteProceeded(ctx context.Context, path string, proceeded int64) error {
	return f.updateMetadata(ctx, path, map[string]string{
		metadataProceeded: strconv.FormatInt(proceeded, 10),
		// progress was made, so the previous attempts were not stuck
		metadataAttempts: "0",
	})
}

func (f *fileRepo) StartAttempt(ctx context.Context, path string) (int, error) {
	obj, attrs, err := f.objectAttrs(ctx, getGCSObjectNameFromURL(gcsAssetBasePath, path))
	if err != nil {
		return 0, err
	}
	attempts, _ := strconv.Atoi(attrs.Metadata[metadataAttempts])
	attempts++
	// Writing a fixed value is idempotent, so it is safe to retry (e.g. on 429
	// when the object metadata was updated less than a second ago).
	if _, err := obj.Retryer(storage.WithPolicy(storage.RetryAlways)).Update(ctx, storage.ObjectAttrsToUpdate{
		Metadata: map[string]string{metadataAttempts: strconv.Itoa(attempts)},
	}); err != nil {
		return 0, fmt.Errorf("update attr: %w", err)
	}
	return attempts, nil
}

func (f *fileRepo) ResetAttempts(ctx context.Context, path string) error {
	return f.updateMetadata(ctx, path, map[string]string{metadataAttempts: "0"})
}

func (f *fileRepo) updateMetadata(ctx context.Context, path string, md map[string]string) error {
	objectName := getGCSObjectNameFromURL(gcsAssetBasePath, path)
	bucket, err := f.getBucket(ctx)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	// Writing fixed values is idempotent, so it is safe to retry.
	obj := bucket.Object(objectName).Retryer(storage.WithPolicy(storage.RetryAlways))
	if _, err := obj.Update(ctx, storage.ObjectAttrsToUpdate{Metadata: md}); err != nil {
		return fmt.Errorf("update attr: %w", err)
	}
	return nil
}

func (f *fileRepo) objectAttrs(ctx context.Context, objectName string) (*storage.ObjectHandle, *storage.ObjectAttrs, error) {
	if objectName == "" {
		return nil, nil, rerror.ErrNotFound
	}

	bucket, err := f.getBucket(ctx)
	if err != nil {
		log.Errorf("gcs: read bucket err: %+v\n", err)
		return nil, nil, rerror.ErrInternalBy(err)
	}

	obj := bucket.Object(objectName)
	attrs, err := obj.Attrs(ctx)
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return nil, nil, rerror.ErrNotFound
		}
		return nil, nil, err
	}
	return obj, attrs, nil
}

func (f *fileRepo) openRangeReader(ctx context.Context, objectName string) (gateway.ReadAtCloser, int64, int64, error) {
	obj, attrs, err := f.objectAttrs(ctx, objectName)
	if err != nil {
		return nil, 0, 0, err
	}

	if f.maxArchiveSize > 0 && attrs.Size > f.maxArchiveSize {
		return nil, 0, 0, fmt.Errorf("%w: size=%d limit=%d", gateway.ErrFileTooLarge, attrs.Size, f.maxArchiveSize)
	}

	proceeded, _ := strconv.ParseInt(attrs.Metadata[metadataProceeded], 10, 64)

	// Pin the generation so that every ranged read sees the same content,
	// even if the object is overwritten while it is being extracted.
	obj = obj.Generation(attrs.Generation)
	open := func(ctx context.Context, off, length int64) (io.ReadCloser, error) {
		return obj.NewRangeReader(ctx, off, length)
	}

	return rangereader.New(ctx, open, attrs.Size), attrs.Size, proceeded, nil
}

func (f *fileRepo) getBucket(ctx context.Context) (*storage.BucketHandle, error) {
	if f.bucket == nil {
		client, err := storage.NewClient(ctx)
		if err != nil {
			return nil, err
		}
		f.bucket = client.Bucket(f.bucketName)
	}
	return f.bucket, nil
}

func getGCSObjectNameFromURL(assetBasePath string, assetPath string) string {
	if assetPath == "" {
		return ""
	}
	return path.Join(assetBasePath, assetPath)
}

func getWorkspaceFromContext(ctx context.Context) string {
	if v := ctx.Value(workspaceContextKey); v != nil {
		if ws, ok := v.(string); ok {
			return ws
		}
	}
	return ""
}
