package gcp

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"strings"
	"sync"

	"cloud.google.com/go/storage"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"google.golang.org/api/iterator"
)

const (
	gcsAssetBasePath string = "assets"
	fileSizeLimit    int64  = 10 * 1024 * 1024 * 1024 // 10GB
)

type fileRepo struct {
	bucketName   string
	base         *url.URL
	cacheControl string
}

func NewFile(bucketName, base, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, rerror.NewE(i18n.T("bucket name is empty"))
	}

	var u *url.URL
	if base == "" {
		base = fmt.Sprintf("https://storage.googleapis.com/%s", bucketName)
	}

	u, err := url.Parse(base)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}

	return &fileRepo{
		bucketName:   bucketName,
		base:         u,
		cacheControl: cacheControl,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, u string, fn string, h map[string]string) (io.ReadCloser, map[string]string, error) {
	p := getGCSObjectPath(u, fn)
	if p == "" {
		return nil, nil, rerror.ErrNotFound
	}

	return f.read(ctx, p, h)
}

func (f *fileRepo) GetAssetFiles(ctx context.Context, u string) ([]gateway.FileEntry, error) {
	p := getGCSObjectPath(u, "")
	b, err := f.bucket(ctx)
	if err != nil {
		return nil, rerror.ErrInternalBy(err)
	}

	it := b.Objects(ctx, &storage.Query{
		Prefix: p,
	})

	var fileEntries []gateway.FileEntry
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}

		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}

		fe := gateway.FileEntry{
			// /22/2232222233333/hoge/tileset.json -> hoge/tileset.json
			Name:            strings.TrimPrefix(strings.TrimPrefix(attrs.Name, p), "/"),
			Size:            attrs.Size,
			ContentType:     attrs.ContentType,
			ContentEncoding: attrs.ContentEncoding,
		}
		fileEntries = append(fileEntries, fe)
	}

	if len(fileEntries) == 0 {
		return nil, gateway.ErrFileNotFound
	}

	return fileEntries, nil
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, int64, error) {
	if file == nil {
		return "", 0, gateway.ErrInvalidFile
	}
	if file.Size >= fileSizeLimit {
		return "", 0, gateway.ErrFileTooLarge
	}

	fileUUID := newUUID()

	p := getGCSObjectPath(fileUUID, file.Name)
	if p == "" {
		return "", 0, gateway.ErrInvalidFile
	}

	size, err := f.upload(ctx, file, p)
	if err != nil {
		return "", 0, err
	}
	return fileUUID, size, nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	p := getGCSObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}

	return f.delete(ctx, p)
}

// DeleteAssets deletes assets data in batch
func (f *fileRepo) DeleteAssets(ctx context.Context, UUIDs []string) error {
	paths := make([]string, 0)
	for _, uuid := range UUIDs {
		path := getGCSObjectPathFolder(uuid)
		if path == "" {
			return gateway.ErrInvalidFile
		}

		paths = append(paths, path)
	}

	return f.batchDelete(ctx, paths)
}

func (f *fileRepo) GetURL(a *asset.Asset) string {
	return getURL(f.base, a.UUID(), a.FileName())
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	uuid := param.UUID
	contentType := param.GetOrGuessContentType()
	if err := validateContentEncoding(param.ContentEncoding); err != nil {
		return nil, err
	}

	p := getGCSObjectPath(uuid, param.Filename)
	if p == "" {
		return nil, gateway.ErrInvalidFile
	}
	bucket, err := f.bucket(ctx)
	if err != nil {
		return nil, err
	}
	opt := &storage.SignedURLOptions{
		Method:      http.MethodPut,
		Expires:     param.ExpiresAt,
		ContentType: contentType,
	}
	if param.ContentEncoding != "" {
		opt.Headers = []string{"Content-Encoding: " + param.ContentEncoding}
	}
	uploadURL, err := bucket.SignedURL(p, opt)
	if err != nil {
		log.Errorf("gcs: failed to issue signed url: %v", err)
		return nil, gateway.ErrUnsupportedOperation
	}
	return &gateway.UploadAssetLink{
		URL:             uploadURL,
		ContentType:     contentType,
		ContentLength:   param.ContentLength,
		ContentEncoding: param.ContentEncoding,
		Next:            "",
	}, nil
}

func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, error) {
	p := getGCSObjectPath(u.UUID(), u.FileName())
	bucket, err := f.bucket(ctx)
	if err != nil {
		return nil, err
	}
	attrs, err := bucket.Object(p).Attrs(ctx)
	if err != nil {
		return nil, fmt.Errorf("attrs(object=%s): %w", p, err)
	}
	return &file.File{
		Content:     nil,
		Name:        u.FileName(),
		Size:        attrs.Size,
		ContentType: attrs.ContentType,
	}, nil
}

func (f *fileRepo) read(ctx context.Context, filename string, headers map[string]string) (io.ReadCloser, map[string]string, error) {
	if filename == "" {
		return nil, nil, rerror.ErrNotFound
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: read bucket err: %+v\n", err)
		return nil, nil, rerror.ErrInternalBy(err)
	}

	obj := bucket.Object(filename)

	if headers != nil && hasAcceptEncoding(headers["Accept-Encoding"], "gzip") {
		obj = obj.ReadCompressed(true)
	}

	var reader *storage.Reader
	{
		var err error
		if headers != nil && headers["Range"] != "" {
			offset, length, err2 := parseRange(headers["Range"])
			if err2 != nil {
				err = err2
			} else {
				reader, err = obj.NewRangeReader(ctx, offset, length)
			}
		} else {
			reader, err = obj.NewReader(ctx)
		}

		if err != nil {
			if errors.Is(err, storage.ErrObjectNotExist) {
				return nil, nil, rerror.ErrNotFound
			}
			log.Errorf("gcs: read err: %+v\n", err)
			return nil, nil, rerror.ErrInternalBy(err)
		}
	}

	resheaders := map[string]string{}

	if h := reader.Attrs.Size; h > 0 {
		resheaders["Content-Length"] = fmt.Sprintf("%d", h)
		if h := reader.Attrs.StartOffset; h > 0 {
			resheaders["Content-Range"] = fmt.Sprintf("bytes %d-%d/%d", h, h+reader.Attrs.Size-1, reader.Attrs.Size)
		}
	}

	if h := reader.Attrs.ContentType; h != "" {
		resheaders["Content-Type"] = h
	}

	if reader.Attrs.ContentEncoding != "" && !reader.Attrs.Decompressed {
		resheaders["Content-Encoding"] = reader.Attrs.ContentEncoding
	}

	if h := reader.Attrs.CacheControl; h != "" {
		resheaders["Cache-Control"] = h
	}

	if h := reader.Attrs.LastModified; !h.IsZero() {
		resheaders["Last-Modified"] = h.Format(http.TimeFormat)
	}

	// if reader.Attrs.CRC32C != 0 {
	// 	resheaders["ETag"] = fmt.Sprintf("crc32c=%d", reader.Attrs.CRC32C)
	// }

	return reader, headers, nil
}

func (f *fileRepo) upload(ctx context.Context, file *file.File, objectName string) (int64, error) {
	if file.Name == "" {
		return 0, gateway.ErrInvalidFile
	}

	if err := validateContentEncoding(file.ContentEncoding); err != nil {
		return 0, err
	}

	if file.ContentEncoding == "identity" {
		file.ContentEncoding = ""
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: upload bucket err: %+v\n", err)
		return 0, rerror.ErrInternalBy(err)
	}

	object := bucket.Object(objectName)
	if err := object.Delete(ctx); err != nil && !errors.Is(err, storage.ErrObjectNotExist) {
		log.Errorf("gcs: upload err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	writer := object.NewWriter(ctx)
	writer.ObjectAttrs.CacheControl = f.cacheControl

	if file.ContentType == "" {
		writer.ObjectAttrs.ContentType = getContentType(file.Name)
	} else {
		writer.ObjectAttrs.ContentType = file.ContentType
	}

	if file.ContentEncoding == "gzip" {
		writer.ObjectAttrs.ContentEncoding = "gzip"
		if writer.ObjectAttrs.ContentType == "" || writer.ObjectAttrs.ContentType == "application/gzip" {
			writer.ObjectAttrs.ContentType = "application/octet-stream"
		}
	}

	if _, err := io.Copy(writer, file.Content); err != nil {
		log.Errorf("gcs: upload err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	if err := writer.Close(); err != nil {
		log.Errorf("gcs: upload close err: %+v\n", err)
		return 0, gateway.ErrFailedToUploadFile
	}

	attr, err := object.Attrs(ctx)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}

	return attr.Size, nil
}

func getContentType(filename string) string {
	ext := filepath.Ext(filename)
	return mime.TypeByExtension(ext)
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

func (f *fileRepo) batchDelete(ctx context.Context, folderNames []string) error {
	if len(folderNames) == 0 {
		return gateway.ErrInvalidInput
	}

	// Get the bucket reference
	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: batch delete bucket error: %+v\n", err)
		return err
	}

	const numWorkers = 5 // Limit concurrency workers

	// Create channels for folder names and errors
	folderChan := make(chan string, len(folderNames))
	errChan := make(chan error, numWorkers)
	var wg sync.WaitGroup

	// Worker function to delete folders
	worker := func() {
		defer wg.Done()
		for folderName := range folderChan {
			if err := f.deleteFolder(ctx, bucket, folderName); err != nil {
				errChan <- fmt.Errorf("failed to delete folder %s: %w", folderName, err)
			}
		}
	}

	// Start worker goroutines
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go worker()
	}

	// Send folder names to workers
	for _, folderName := range folderNames {
		if folderName == "" {
			continue
		}

		if folderName[len(folderName)-1] != '/' {
			folderName += "/" // Ensure folder names end with "/"
		}
		folderChan <- folderName
	}
	close(folderChan) // Close channel after sending all folder names

	// Wait for all workers to finish
	wg.Wait()
	close(errChan)

	// Collect errors
	var finalErr error
	for err := range errChan {
		if err != nil {
			finalErr = fmt.Errorf("batch delete encountered errors: %w", err)
		}
	}

	if finalErr != nil {
		log.Errorf("Batch delete completed with errors.")
		return finalErr
	}

	return nil
}

func (f *fileRepo) deleteFolder(ctx context.Context, bucket *storage.BucketHandle, folderPrefix string) error {
	it := bucket.Objects(ctx, &storage.Query{Prefix: folderPrefix})

	for {
		objAttrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Errorf("gcs: list objects error: %+v\n", err)
			return err
		}

		obj := bucket.Object(objAttrs.Name)
		if err := obj.Delete(ctx); err != nil {
			if errors.Is(err, storage.ErrObjectNotExist) {
				continue
			}
			log.Errorf("gcs: delete object %s error: %+v\n", objAttrs.Name, err)
			return err
		}
	}

	return nil
}

func getGCSObjectPath(uuid, objectName string) string {
	if uuid == "" || !IsValidUUID(uuid) {
		return ""
	}

	return path.Join(gcsAssetBasePath, uuid[:2], uuid[2:], objectName)
}

func getGCSObjectPathFolder(uuid string) string {
	if uuid == "" || !IsValidUUID(uuid) {
		return ""
	}
	return path.Join(gcsAssetBasePath, uuid[:2], uuid[2:])
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

func IsValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}

func getURL(host *url.URL, uuid, fName string) string {
	return host.JoinPath(gcsAssetBasePath, uuid[:2], uuid[2:], fName).String()
}

func validateContentEncoding(ce string) error {
	if ce != "" && ce != "identity" && ce != "gzip" {
		return gateway.ErrUnsupportedContentEncoding
	}
	return nil
}

func parseRange(ran string) (int64, int64, error) {
	if ran == "" {
		return 0, -1, nil
	}

	var offset, length int64
	if _, err := fmt.Sscanf(ran, "bytes=%d-%d", &offset, &length); err != nil {
		return 0, 0, fmt.Errorf("invalid range: %w", err)
	}
	if offset < 0 || length < 0 {
		return 0, 0, fmt.Errorf("invalid range: offset=%d, length=%d", offset, length)
	}
	return offset, length, nil
}

func hasAcceptEncoding(accept, encoding string) bool {
	if accept == "" {
		return false
	}
	for _, e := range strings.Split(accept, ",") {
		if strings.TrimSpace(e) == encoding {
			return true
		}
	}
	return false
}
