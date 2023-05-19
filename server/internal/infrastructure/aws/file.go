package aws

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/i18n"
	"github.com/reearth/reearthx/rerror"
)

const (
	s3AssetBasePath string = "assets"
	fileSizeLimit   int64  = 10 * 1024 * 1024 * 1024 // 10GB
)

type fileRepo struct {
	bucketName   string
	baseURL      *url.URL
	cacheControl string
	s3Client     *s3.S3
}

func NewFile(bucketName, accessKeyID, secretAccessKey, baseURL, cacheControl string) (gateway.File, error) {
	if bucketName == "" {
		return nil, rerror.NewE(i18n.T("bucket name is empty"))
	}

	var u *url.URL
	if baseURL == "" {
		baseURL = fmt.Sprintf("https://%s.s3.amazonaws.com/", bucketName)
	}

	var err error
	u, _ = url.Parse(baseURL)
	if err != nil {
		return nil, rerror.NewE(i18n.T("invalid base URL"))
	}

	awsSession, _ := session.NewSession(&aws.Config{
		Region:      aws.String("us-east-1"),
		Credentials: credentials.NewStaticCredentials(accessKeyID, secretAccessKey, ""),
	})

	s3Client := s3.New(awsSession)

	return &fileRepo{
		bucketName:   bucketName,
		baseURL:      u,
		cacheControl: cacheControl,
		s3Client:     s3Client,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, u string, fn string) (io.ReadCloser, error) {
	panic("not implemented")
}

func (f *fileRepo) GetAssetFiles(ctx context.Context, u string) ([]gateway.FileEntry, error) {
	panic("not implemented")
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (string, int64, error) {
	panic("not implemented")
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u string, fn string) error {
	panic("not implemented")
}

func (f *fileRepo) GetURL(a *asset.Asset) string {
	panic("not implemented")
}

func (f *fileRepo) IssueUploadAssetLink(ctx context.Context, filename, contentType string, expiresAt time.Time) (string, string, error) {
	panic("not implemented")
}

func (f *fileRepo) UploadedAsset(ctx context.Context, u *asset.Upload) (*file.File, error) {
	panic("not implemented")
}
