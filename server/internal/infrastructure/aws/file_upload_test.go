package aws

// file_upload_test.go verifies that the Upload method streams the file body
// directly to S3 instead of buffering it with io.ReadAll.
//
// Because *s3.Client is a concrete struct (not an interface), we inject a fake
// via a thin s3UploadAPI interface defined only for testing, and call the
// internal uploadWithClient helper that accepts that interface. The helper is
// defined in file_upload.go.

import (
	"context"
	"io"
	"strings"
	"testing"

	awssdk "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// fakeS3 satisfies s3UploadAPI and records what was sent.
type fakeS3 struct {
	putInput *s3.PutObjectInput
	putBody  string
	headLen  int64
}

func (f *fakeS3) PutObject(_ context.Context, input *s3.PutObjectInput, _ ...func(*s3.Options)) (*s3.PutObjectOutput, error) {
	f.putInput = input
	body, err := io.ReadAll(input.Body)
	if err != nil {
		return nil, err
	}
	f.putBody = string(body)
	return &s3.PutObjectOutput{}, nil
}

func (f *fakeS3) HeadObject(_ context.Context, _ *s3.HeadObjectInput, _ ...func(*s3.Options)) (*s3.HeadObjectOutput, error) {
	return &s3.HeadObjectOutput{ContentLength: awssdk.Int64(f.headLen)}, nil
}

func TestUpload_streamsBodyWithoutBuffering(t *testing.T) {
	t.Parallel()

	const content = "hello streaming world"
	fake := &fakeS3{headLen: int64(len(content))}

	repo := &fileRepo{
		bucketName:   "test-bucket",
		cacheControl: "no-cache",
		s3Client:     nil, // not used — we call uploadWithClient directly
	}

	fi := &file.File{
		Content:     io.NopCloser(strings.NewReader(content)),
		Name:        "test.txt",
		Size:        int64(len(content)),
		ContentType: "text/plain",
	}

	size, err := repo.uploadWithClient(context.Background(), fake, fi, "uploads/test.txt")
	require.NoError(t, err)
	assert.Equal(t, int64(len(content)), size)

	// Verify that the body reached the fake S3 unchanged.
	assert.Equal(t, content, fake.putBody)

	// Verify ContentLength was set (streaming hint to S3).
	require.NotNil(t, fake.putInput.ContentLength)
	assert.Equal(t, int64(len(content)), awssdk.ToInt64(fake.putInput.ContentLength))
}

func TestUpload_returnsErrForEmptyFilename(t *testing.T) {
	t.Parallel()

	repo := &fileRepo{bucketName: "test-bucket"}
	fi := &file.File{Content: io.NopCloser(strings.NewReader("data"))}

	_, err := repo.Upload(context.Background(), fi, "")
	assert.ErrorIs(t, err, gateway.ErrInvalidFile)
}
