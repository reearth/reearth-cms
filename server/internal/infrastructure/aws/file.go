package aws

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/google/uuid"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	s3AssetBasePath string        = "assets"
	fileSizeLimit   int64         = 10 * 1024 * 1024 * 1024 // 10GB
	expires         time.Duration = time.Minute * 15
)

type fileRepo struct {
	bucketName   string
	baseURL      *url.URL
	cacheControl string
	s3Client     *s3.Client
}

func NewFile(ctx context.Context, bucketName, baseURL, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	var u *url.URL
	if baseURL == "" {
		baseURL = fmt.Sprintf("https://%s.s3.amazonaws.com/", bucketName)
	}

	u, err := url.Parse(baseURL)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	return &fileRepo{
		bucketName:   bucketName,
		baseURL:      u,
		cacheControl: cacheControl,
		s3Client:     s3.NewFromConfig(cfg),
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, u string, fn string, headers map[string]string) (io.ReadCloser, map[string]string, error) {
	p := getS3ObjectPath(u, fn)
	if p == "" {
		return nil, nil, rerror.ErrNotFound
	}
	return f.read(ctx, p, headers)
}

func (f *fileRepo) GetAssetFiles(ctx context.Context, u string) ([]gateway.FileEntry, error) {
	p := getS3ObjectPath(u, "")
	var fileEntries []gateway.FileEntry
	paginator := s3.NewListObjectsV2Paginator(f.s3Client, &s3.ListObjectsV2Input{
		Bucket: aws.String(f.bucketName),
		Prefix: aws.String(p),
	})

	for paginator.HasMorePages() {
		output, err := paginator.NextPage(ctx)
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		for _, obj := range output.Contents {
			fe := gateway.FileEntry{
				Name: strings.TrimPrefix(lo.FromPtr(obj.Key), p),
				Size: lo.FromPtr(obj.Size),
			}
			fileEntries = append(fileEntries, fe)
		}
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
	p := getS3ObjectPath(fileUUID, file.Name)
	if p == "" {
		return "", 0, gateway.ErrInvalidFile
	}
	size, err := f.upload(ctx, file, p)
	if err != nil {
		return "", 0, rerror.ErrInternalBy(err)
	}

	return fileUUID, size, nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	p := getS3ObjectPath(u, fn)
	if p == "" {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, p)
}

func (f *fileRepo) GetURL(a *asset.Asset) string {
	return getURL(f.baseURL.String(), a.UUID(), a.FileName())
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, param gateway.IssueUploadAssetParam) (*gateway.UploadAssetLink, error) {
	// https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html
	const maxPartSize = 5 * 1024 * 1024 * 1024
	p := getS3ObjectPath(param.UUID, param.Filename)
	if p == "" {
		return nil, gateway.ErrInvalidFile
	}
	contentType := param.GetOrGuessContentType()
	if param.Cursor != "" {
		cursor, err := parseUploadCursor(param.Cursor)
		if err != nil {
			return nil, fmt.Errorf("parse cursor(%s): %w", param.Cursor, err)
		}
		uploaded := maxPartSize * (cursor.Part - 1)
		if completed := param.ContentLength <= uploaded; completed {
			var mu types.CompletedMultipartUpload
			var marker *string
			for {
				o, err := f.s3Client.ListParts(ctx, &s3.ListPartsInput{
					Bucket:           aws.String(f.bucketName),
					Key:              aws.String(p),
					UploadId:         aws.String(cursor.UploadID),
					PartNumberMarker: marker,
				})
				if err != nil {
					return nil, fmt.Errorf("list parts: %w", err)
				}
				for _, part := range o.Parts {
					mu.Parts = append(mu.Parts, types.CompletedPart{
						ETag:       part.ETag,
						PartNumber: part.PartNumber,
					})
				}
				if o.IsTruncated == nil || !*o.IsTruncated {
					break
				}
				marker = o.PartNumberMarker
			}
			if _, err := f.s3Client.CompleteMultipartUpload(ctx, &s3.CompleteMultipartUploadInput{
				Bucket:          aws.String(f.bucketName),
				Key:             aws.String(p),
				UploadId:        aws.String(cursor.UploadID),
				MultipartUpload: &mu,
			}); err != nil {
				return nil, fmt.Errorf("complete multipart uplaod: %w", err)
			}
			return &gateway.UploadAssetLink{}, nil
		} else {
			partSize := min(param.ContentLength-uploaded, maxPartSize)
			presigned, err := s3.NewPresignClient(f.s3Client).PresignUploadPart(ctx, &s3.UploadPartInput{
				Bucket:        aws.String(f.bucketName),
				Key:           aws.String(p),
				PartNumber:    aws.Int32(int32(cursor.Part)),
				UploadId:      aws.String(cursor.UploadID),
				ContentLength: aws.Int64(partSize),
			}, func(options *s3.PresignOptions) {
				options.Expires = expires
			})
			if err != nil {
				return nil, fmt.Errorf("presign upload part: %w", err)
			}
			return &gateway.UploadAssetLink{
				URL:           presigned.URL,
				ContentLength: partSize,
				Next:          cursor.Next().String(),
			}, nil
		}
	}

	// PutObject can only be used for up to 5GB
	// Conversely, multipart upload cannot be used for files smaller than 5MB
	// Since PutObject reduces the number of interactions, use PutObject for files smaller than 5GB
	if param.ContentLength <= maxPartSize {
		presigned, err := s3.NewPresignClient(f.s3Client).PresignPutObject(ctx, &s3.PutObjectInput{
			Bucket:        aws.String(f.bucketName),
			CacheControl:  aws.String(f.cacheControl),
			Key:           aws.String(p),
			ContentType:   aws.String(contentType),
			ContentLength: aws.Int64(param.ContentLength),
		}, func(options *s3.PresignOptions) {
			options.Expires = expires
		})
		if err != nil {
			return nil, rerror.ErrInternalBy(err)
		}
		return &gateway.UploadAssetLink{
			URL:           presigned.URL,
			ContentType:   contentType,
			ContentLength: param.ContentLength,
		}, nil
	}
	r, err := f.s3Client.CreateMultipartUpload(ctx, &s3.CreateMultipartUploadInput{
		Bucket:       aws.String(f.bucketName),
		CacheControl: aws.String(f.cacheControl),
		Key:          aws.String(p),
		ContentType:  aws.String(contentType),
	})
	if err != nil {
		return nil, fmt.Errorf("create multipart upload: %w", err)
	}
	presigned, err := s3.NewPresignClient(f.s3Client).PresignUploadPart(ctx, &s3.UploadPartInput{
		Bucket:        aws.String(f.bucketName),
		Key:           aws.String(p),
		PartNumber:    aws.Int32(1),
		UploadId:      r.UploadId,
		ContentLength: aws.Int64(maxPartSize),
	}, func(options *s3.PresignOptions) {
		options.Expires = expires
	})
	if err != nil {
		return nil, fmt.Errorf("presign upload part: %w", err)
	}
	return &gateway.UploadAssetLink{
		URL:           presigned.URL,
		ContentLength: maxPartSize,
		Next:          uploadCursor{UploadID: lo.FromPtr(r.UploadId), Part: 2}.String(),
	}, nil
}

func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, error) {
	p := getS3ObjectPath(u.UUID(), u.FileName())
	obj, err := f.s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(p),
	})
	if err != nil {
		return nil, err
	}

	file := &file.File{
		Content:     nil,
		Name:        u.FileName(),
		Size:        lo.FromPtr(obj.ContentLength),
		ContentType: lo.FromPtr(obj.ContentType),
	}
	return file, nil
}

func (f *fileRepo) read(ctx context.Context, filename string, headers map[string]string) (io.ReadCloser, map[string]string, error) {
	if filename == "" {
		return nil, nil, rerror.ErrNotFound
	}

	var ifMatch, ifNoneMatch, rang string
	var ifModifiedSince, ifUnmodifiedSince time.Time
	if headers != nil {
		ifMatch = headers["If-Match"]
		ifNoneMatch = headers["If-None-Match"]
		rang = headers["Range"]

		if h := headers["If-Modified-Since"]; h != "" {
			t, err := time.Parse(time.RFC1123, h)
			if err != nil {
				return nil, nil, rerror.ErrInvalidParams
			}
			ifModifiedSince = t
		}

		if h := headers["IfUnmodifiedSince"]; h != "" {
			t, err := time.Parse(time.RFC1123, h)
			if err != nil {
				return nil, nil, rerror.ErrInvalidParams
			}
			ifUnmodifiedSince = t
		}
	}

	resp, err := f.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket:            aws.String(f.bucketName),
		Key:               aws.String(filename),
		IfMatch:           lo.EmptyableToPtr(ifMatch),
		IfModifiedSince:   lo.EmptyableToPtr(ifModifiedSince),
		IfNoneMatch:       lo.EmptyableToPtr(ifNoneMatch),
		IfUnmodifiedSince: lo.EmptyableToPtr(ifUnmodifiedSince),
		Range:             lo.EmptyableToPtr(rang),
	})
	if err != nil {
		return nil, nil, rerror.ErrInternalBy(err)
	}

	resheaders := map[string]string{}

	if h := resp.ContentLength; h != nil {
		resheaders["Content-Length"] = fmt.Sprintf("%d", *h)
	}

	if h := resp.ContentType; h != nil {
		resheaders["Content-Type"] = *h
	}

	if h := resp.LastModified; h != nil {
		resheaders["Last-Modified"] = h.UTC().Format("Mon, 02 Jan 2006 15:04:05 GMT")
	}

	if h := resp.CacheControl; h != nil {
		resheaders["Cache-Control"] = *h
	}

	if h := resp.ContentEncoding; h != nil {
		resheaders["Content-Encoding"] = *h
	}

	if h := resp.ContentDisposition; h != nil {
		resheaders["Content-Disposition"] = *h
	}

	if h := resp.ContentLanguage; h != nil {
		resheaders["Content-Language"] = *h
	}

	if h := resp.ETag; h != nil {
		resheaders["ETag"] = *h
	}

	if h := resp.AcceptRanges; h != nil {
		resheaders["Accept-Ranges"] = *h
	}

	if h := resp.ContentRange; h != nil {
		resheaders["Content-Range"] = *h
	}

	return resp.Body, resheaders, nil
}

func (f *fileRepo) upload(ctx context.Context, file *file.File, filename string) (int64, error) {
	if filename == "" {
		return 0, gateway.ErrInvalidFile
	}

	ba, err := io.ReadAll(file.Content)
	if err != nil {
		return 0, rerror.ErrInternalBy(err)
	}
	body := bytes.NewReader(ba)

	_, err = f.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:          aws.String(f.bucketName),
		CacheControl:    aws.String(f.cacheControl),
		ContentEncoding: lo.EmptyableToPtr(file.ContentEncoding),
		ContentType:     aws.String(file.ContentType),
		Key:             aws.String(filename),
		Body:            body,
	})
	if err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	result, err := f.s3Client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})

	if err != nil {
		return 0, gateway.ErrFailedToUploadFile
	}

	return lo.FromPtr(result.ContentLength), nil
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrInvalidFile
	}

	_, err := f.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(filename),
	})
	if err != nil {
		return rerror.ErrInternalBy(err)
	}

	return nil
}

// DeleteAssets deletes multiple assets in batch
func (f *fileRepo) DeleteAssets(ctx context.Context, folders []string) error {
	if len(folders) == 0 {
		return gateway.ErrInvalidFile
	}

	const maxWorkers = 10 // Limit concurrent operations
	type deleteResult struct {
		filename string
		err      error
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	// Create a worker pool with limited concurrency
	sem := make(chan struct{}, maxWorkers)

	var wg sync.WaitGroup
	resultCh := make(chan deleteResult, len(folders))

	for _, filename := range folders {
		if filename == "" {
			continue
		}

		wg.Add(1)
		go func(fn string) {
			defer wg.Done()

			// Acquire semaphore
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				resultCh <- deleteResult{filename: fn, err: ctx.Err()}
				return
			}

			// Perform deletion
			err := f.delete(ctx, fn)
			resultCh <- deleteResult{filename: fn, err: err}

			// Cancel context on first error to stop other operations
			if err != nil {
				cancel()
			}
		}(filename)
	}

	// Close result channel after all goroutines complete
	go func() {
		wg.Wait()
		close(resultCh)
	}()

	// Collect all errors
	var errors []error
	var failedFiles []string
	for result := range resultCh {
		if result.err != nil {
			errors = append(errors, fmt.Errorf("failed to delete %s: %w", result.filename, result.err))
			failedFiles = append(failedFiles, result.filename)
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("failed to delete %d files (%v): %v", len(errors), failedFiles, errors[0])
	}

	return nil
}

func getS3ObjectPath(uuid, objectName string) string {
	if uuid == "" || !isValidUUID(uuid) {
		return ""
	}

	return path.Join(s3AssetBasePath, uuid[:2], uuid[2:], objectName)
}

func newUUID() string {
	return uuid.New().String()
}

func isValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}

func getURL(host, uuid, fName string) string {
	baseURL, _ := url.Parse(host)
	return baseURL.JoinPath(s3AssetBasePath, uuid[:2], uuid[2:], fName).String()
}

type uploadCursor struct {
	UploadID string
	Part     int64 // 1-indexed
}

func (c uploadCursor) Next() uploadCursor {
	return uploadCursor{UploadID: c.UploadID, Part: c.Part + 1}
}

func (c uploadCursor) String() string {
	return strconv.FormatInt(c.Part, 10) + "_" + c.UploadID
}

func parseUploadCursor(c string) (*uploadCursor, error) {
	partStr, uploadID, found := strings.Cut(c, "_")
	if !found {
		return nil, fmt.Errorf("separator not found")
	}
	part, err := strconv.ParseInt(partStr, 10, 32)
	if err != nil {
		return nil, fmt.Errorf("parse part: %w", err)
	}
	return &uploadCursor{
		UploadID: uploadID,
		Part:     part,
	}, nil
}
