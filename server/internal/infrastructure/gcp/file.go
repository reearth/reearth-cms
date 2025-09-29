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
	"google.golang.org/api/option"
)

const (
	gcsAssetBasePath string = "assets"
	fileSizeLimit    int64  = 10 * 1024 * 1024 * 1024 // 10GB
)

const workspaceContextKey = "workspace"

type fileRepo struct {
	bucketName       string
	publicBase       *url.URL
	privateBase      *url.URL
	cacheControl     string
	public           bool
	replaceUploadURL bool
}

func NewFile(bucketName, publicBase, cacheControl string, replaceUploadURL bool) (gateway.File, error) {
	if bucketName == "" {
		return nil, rerror.NewE(i18n.T("bucket name is empty"))
	}

	var u *url.URL
	if publicBase == "" {
		publicBase = fmt.Sprintf("https://storage.googleapis.com/%s", bucketName)
	}

	u, err := url.Parse(publicBase)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}

	return &fileRepo{
		bucketName:       bucketName,
		publicBase:       u,
		privateBase:      nil,
		cacheControl:     cacheControl,
		public:           true,
		replaceUploadURL: replaceUploadURL,
	}, nil
}

func NewFileWithACL(bucketName, publicBase, privateBase, cacheControl string, replaceUploadURL bool) (gateway.File, error) {
	f, err := NewFile(bucketName, publicBase, cacheControl, replaceUploadURL)
	if err != nil {
		return nil, err
	}
	u, err := url.Parse(privateBase)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}
	fr := f.(*fileRepo)
	fr.privateBase = u
	fr.public = false
	return fr, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, u string, fn string, h map[string]string) (io.ReadCloser, map[string]string, error) {
	p := getGCSObjectPath(u, fn)
	if p == "" {
		return nil, nil, rerror.ErrNotFound
	}

	return f.Read(ctx, p, h)
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
		if errors.Is(err, iterator.Done) {
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

	size, err := f.Upload(ctx, file, p)
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

func (f *fileRepo) PublishAsset(ctx context.Context, u string, fn string) error {
	if f.public {
		return gateway.ErrUnsupportedOperation
	}
	p := getGCSObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}

	return f.publish(ctx, p, true)
}

func (f *fileRepo) UnpublishAsset(ctx context.Context, u string, fn string) error {
	if f.public {
		return gateway.ErrUnsupportedOperation
	}
	p := getGCSObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}

	return f.publish(ctx, p, false)
}

func (f *fileRepo) GetAccessInfoResolver() asset.AccessInfoResolver {
	return func(a *asset.Asset) *asset.AccessInfo {
		base := f.privateBase
		publiclyAccessible := f.public || a.Public()
		if publiclyAccessible {
			base = f.publicBase
		}
		return &asset.AccessInfo{
			Url:    getURL(base, a.UUID(), url.PathEscape(a.FileName())),
			Public: publiclyAccessible,
		}
	}
}

func (f *fileRepo) GetAccessInfo(a *asset.Asset) *asset.AccessInfo {
	if a == nil {
		return nil
	}
	return f.GetAccessInfoResolver()(a)
}

func (f *fileRepo) GetBaseURL() string {
	return f.publicBase.String()
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	contentType := param.GetOrGuessContentType()
	if err := validateContentEncoding(param.ContentEncoding); err != nil {
		return nil, err
	}

	p := getGCSObjectPath(param.UUID, param.Filename)
	if p == "" {
		return nil, gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		return nil, err
	}
	opt := &storage.SignedURLOptions{
		Scheme:      storage.SigningSchemeV4,
		Method:      http.MethodPut,
		Expires:     param.ExpiresAt,
		ContentType: contentType,
		QueryParameters: map[string][]string{
			"reearth-x-workspace": {param.Workspace},
			"reearth-x-project":   {param.Project},
			"reearth-x-public":    {fmt.Sprintf("%v", param.Public)},
		},
	}

	var headers []string
	if param.ContentEncoding != "" {
		headers = append(headers, "Content-Encoding: "+param.ContentEncoding)
	}

	if len(headers) > 0 {
		opt.Headers = headers
	}
	uploadURL, err := bucket.SignedURL(p, opt)
	if err != nil {
		log.Errorf("gcs: failed to issue signed url: %v", err)
		return nil, gateway.ErrUnsupportedOperation
	}

	return &gateway.UploadAssetLink{
		URL:             f.toPublicUrl(uploadURL),
		ContentType:     contentType,
		ContentLength:   param.ContentLength,
		ContentEncoding: param.ContentEncoding,
		Next:            "",
	}, nil
}

func (f *fileRepo) toPublicUrl(uploadURL string) string {
	// Replace storage.googleapis.com with custom asset base URL if configured and enabled
	if f.replaceUploadURL && f.publicBase != nil && f.publicBase.Host != "" && f.publicBase.Host != "storage.googleapis.com" {
		parsedURL, err := url.Parse(uploadURL)
		if err == nil {
			parsedURL.Scheme = f.publicBase.Scheme
			parsedURL.Host = f.publicBase.Host
			parsedURL.Path = path.Join(f.publicBase.Path, parsedURL.Path)
			uploadURL = parsedURL.String()
		}
	}
	return uploadURL
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

func (f *fileRepo) Read(ctx context.Context, filename string, headers map[string]string) (io.ReadCloser, map[string]string, error) {
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

func (f *fileRepo) Upload(ctx context.Context, file *file.File, objectName string) (int64, error) {
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
	writer.CacheControl = f.cacheControl

	if workspace := getWorkspaceFromContext(ctx); workspace != "" {
		if writer.Metadata == nil {
			writer.Metadata = make(map[string]string)
		}
		writer.Metadata["X-Reearth-Workspace-ID"] = workspace
	}

	if file.ContentType == "" {
		writer.ContentType = getContentType(file.Name)
	} else {
		writer.ContentType = file.ContentType
	}

	if file.ContentEncoding == "gzip" {
		writer.ContentEncoding = "gzip"
		if writer.ContentType == "" || writer.ContentType == "application/gzip" {
			writer.ContentType = "application/octet-stream"
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

func (f *fileRepo) publish(ctx context.Context, filename string, public bool) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	bucket, err := f.bucket(ctx)
	if err != nil {
		log.Errorf("gcs: get bucket err: %+v\n", err)
		return rerror.ErrInternalBy(err)
	}

	object := bucket.Object(filename)
	if public {
		err = object.ACL().Set(ctx, storage.AllUsers, storage.RoleReader)
	} else {
		err = object.ACL().Delete(ctx, storage.AllUsers)
	}
	if err != nil {
		if errors.Is(err, storage.ErrObjectNotExist) {
			return gateway.ErrFileNotFound
		}

		log.Errorf("gcs: acl err: %+v\n", err)
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
	return f.bucketWithOptions(ctx, false)
}

func (f *fileRepo) bucketWithOptions(ctx context.Context, forSigning bool) (*storage.BucketHandle, error) {
	var client *storage.Client
	var err error

	log.Infof("DEBUG bucketWithOptions: bucketName='%s', customEndpoint='%s', forSigning=%v",
		f.bucketName, f.customEndpoint, forSigning)

	// For signed URLs, always use standard GCS client to ensure signatures work
	// with storage.googleapis.com, regardless of custom endpoint configuration
	if forSigning || f.customEndpoint == "" {
		log.Infof("DEBUG: Using standard GCS client")
		client, err = storage.NewClient(ctx)
	} else {
		log.Infof("DEBUG: Using custom endpoint client: %s", f.customEndpoint)
		client, err = storage.NewClient(ctx, option.WithEndpoint(f.customEndpoint))
	}

	if err != nil {
		log.Errorf("gcs: failed to initialize client: %v", err)
		return nil, err
	}

	bucket := client.Bucket(f.bucketName)
	log.Infof("DEBUG: Created bucket handle for: '%s'", f.bucketName)
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

func getWorkspaceFromContext(ctx context.Context) string {
	if v := ctx.Value(contextKey(workspaceContextKey)); v != nil {
		if ws, ok := v.(string); ok {
			return ws
		}
	}
	return ""
}

type contextKey string
