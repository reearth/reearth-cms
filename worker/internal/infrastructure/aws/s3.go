package aws

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"github.com/samber/lo"
)

const (
	s3AssetBasePath string = "assets"
)

type fileRepo struct {
	bucketName   string
	cacheControl string
	s3Client     *s3.S3
	s3Uploader   *s3manager.Uploader
}

type writeCloser struct {
	io.Writer
}

func (wc *writeCloser) Close() error {
	if closer, ok := wc.Writer.(io.Closer); ok {
		return closer.Close()
	}
	return nil
}

func NewFile(bucketName, region, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(region),
	})
	if err != nil {
		log.Errorf("aws: failed to create session: %v\n", err)
		return nil, rerror.ErrInternalBy(err)
	}

	s3Client := s3.New(sess)
	s3Uploader := s3manager.NewUploaderWithClient(s3Client)

	return &fileRepo{
		bucketName:   bucketName,
		cacheControl: cacheControl,
		s3Client:     s3Client,
		s3Uploader:   s3Uploader,
	}, nil
}

func (f *fileRepo) Read(ctx context.Context, filePath string) (gateway.ReadAtCloser, int64, int64, error) {
	if filePath == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}

	objectKey := getS3ObjectKeyFromURL(s3AssetBasePath, filePath)

	params := &s3.GetObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(objectKey),
	}

	resp, err := f.s3Client.GetObjectWithContext(ctx, params)
	if err != nil {
		log.Errorf("aws: read object err: %+v\n", err)
		return nil, 0, 0, rerror.ErrInternalBy(err)
	}

	proceeded, _ := strconv.ParseInt(lo.FromPtr(resp.Metadata["proceeded"]), 10, 64)

	// Read all data into memory
	objectData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, 0, 0, err
	}

	reader := bytes.NewReader(objectData)
	bufReader := buffer{
		b: *reader,
	}

	return &bufReader, int64(len(objectData)), proceeded, nil
}

func (f *fileRepo) Upload(ctx context.Context, name string) (io.WriteCloser, error) {
	if name == "" {
		return nil, gateway.ErrInvalidFile
	}

	pr, pw := io.Pipe()

	go func() {
		defer pw.Close()

		key := path.Join(s3AssetBasePath, name)

		params := &s3manager.UploadInput{
			Bucket:      aws.String(f.bucketName),
			Key:         aws.String(key),
			Body:        pr,
			ContentType: aws.String("application/octet-stream"), // Set the content type accordingly
		}

		_, err := f.s3Uploader.UploadWithContext(context.TODO(), params)
		if err != nil {
			log.Errorf("aws: upload object err: %v\n", err)
		}
	}()

	return &writeCloser{Writer: pw}, nil
}

func (f *fileRepo) WriteProceeded(ctx context.Context, filePath string, proceeded int64) error {
	if filePath == "" {
		return rerror.ErrNotFound
	}

	objectKey := getS3ObjectKeyFromURL(s3AssetBasePath, filePath)

	params := &s3.CopyObjectInput{
		Bucket:     aws.String(f.bucketName),
		CopySource: aws.String(fmt.Sprintf("%s/%s", f.bucketName, objectKey)),
		Key:        aws.String(objectKey),
		Metadata: map[string]*string{
			"proceeded": aws.String(strconv.FormatInt(proceeded, 10)),
		},
	}

	_, err := f.s3Client.CopyObjectWithContext(ctx, params)
	if err != nil {
		return fmt.Errorf("copy object: %w", err)
	}

	return nil
}

func getS3ObjectKeyFromURL(assetBasePath, assetPath string) string {
	if assetPath == "" {
		return ""
	}

	return path.Join(assetBasePath, assetPath)
}

type buffer struct {
	b bytes.Reader
}

func (b *buffer) Close() error {
	return nil
}

func (b *buffer) ReadAt(buf []byte, offset int64) (int, error) {
	return b.b.ReadAt(buf, offset)
}

type s3Writer struct {
	io.Writer
}

func (sw *s3Writer) Close() error {
	return nil
}
