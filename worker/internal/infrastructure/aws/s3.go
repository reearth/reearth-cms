package aws

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"path"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearthx/rerror"
)

const (
	s3AssetBasePath string = "assets"
)

type fileRepo struct {
	bucketName   string
	cacheControl string
	s3Client     *s3.Client
}

func NewFile(ctx context.Context, bucketName, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, errors.New("bucket name is empty")
	}

	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}

	return &fileRepo{
		bucketName:   bucketName,
		cacheControl: cacheControl,
		s3Client:     s3.NewFromConfig(cfg),
	}, nil
}

func (f *fileRepo) Read(ctx context.Context, path string) (gateway.ReadAtCloser, int64, int64, error) {
	if path == "" {
		return nil, 0, 0, rerror.ErrNotFound
	}

	objectName := getS3ObjectNameFromURL(s3AssetBasePath, path)

	output, err := f.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(f.bucketName),
		Key:    aws.String(objectName),
	})
	
	if err != nil {
		return nil, 0, 0, err
	}

	proceeded, _ := strconv.ParseInt(output.Metadata["proceeded"], 10, 64)

	// read all data on memory
	objectData, err := io.ReadAll(output.Body)
	if err != nil {
		return nil, 0, 0, err
	}

	reader := bytes.NewReader(objectData)
	bufReader := buffer{
		*reader,
	}

	return &bufReader, int64(len(objectData)), proceeded, nil
}

func (f *fileRepo) Upload(ctx context.Context, name string) (io.WriteCloser, error) {
	panic("not implemented")
}

func (f *fileRepo) WriteProceeded(ctx context.Context, path string, proceeded int64) error {
	objectName := getS3ObjectNameFromURL(s3AssetBasePath, path)

	_, err := f.s3Client.CopyObject(context.TODO(), &s3.CopyObjectInput{
		Bucket:     aws.String(f.bucketName),
		CopySource: aws.String(f.bucketName + "/" + objectName),
		Key:        aws.String(objectName),
		Metadata: map[string]string{
			"proceeded": strconv.FormatInt(proceeded, 10),
		},
	})
	if err != nil {
		return fmt.Errorf("failed to update metadata: %w", err)
	}

	return nil
}

func getS3ObjectNameFromURL(assetBasePath string, assetPath string) string {
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

func (b *buffer) ReadAt(b2 []byte, off int64) (n int, err error) {
	return b.b.ReadAt(b2, off)
}
