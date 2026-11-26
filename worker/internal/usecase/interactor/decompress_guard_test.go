package interactor

import (
	"context"
	"errors"
	"fmt"
	"io"
	"testing"

	wfs "github.com/reearth/reearth-cms/worker/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// spyFile wraps a gateway.File and records what the usecase does with it.
type spyFile struct {
	gateway.File
	attempt    int
	attemptErr error
	readErr    error
	reads      int
	opened     int
	closed     int
	resets     int
}

func (s *spyFile) StartAttempt(context.Context, string) (int, error) {
	if s.attemptErr != nil {
		return 0, s.attemptErr
	}
	s.attempt++
	return s.attempt, nil
}

func (s *spyFile) ResetAttempts(context.Context, string) error {
	s.resets++
	s.attempt = 0
	return nil
}

func (s *spyFile) Read(ctx context.Context, p string) (gateway.ReadAtCloser, int64, int64, error) {
	s.reads++
	if s.readErr != nil {
		return nil, 0, 0, s.readErr
	}
	r, size, proceeded, err := s.File.Read(ctx, p)
	if err != nil {
		return nil, 0, 0, err
	}
	s.opened++
	return &closeSpy{ReadAtCloser: r, onClose: func() { s.closed++ }}, size, proceeded, nil
}

type closeSpy struct {
	gateway.ReadAtCloser
	onClose func()
}

func (c *closeSpy) Close() error {
	c.onClose()
	return c.ReadAtCloser.Close()
}

type recordingCMS struct {
	statuses []asset.ArchiveExtractionStatus
}

func (c *recordingCMS) NotifyAssetDecompressed(_ context.Context, _ string, s *asset.ArchiveExtractionStatus) error {
	c.statuses = append(c.statuses, *s)
	return nil
}

func newSpyUsecase(t *testing.T, fs afero.Fs, opts ...Option) (*Usecase, *spyFile, *recordingCMS) {
	t.Helper()
	base, err := wfs.NewFile(fs, "")
	require.NoError(t, err)
	f := &spyFile{File: base}
	cms := &recordingCMS{}
	return NewUsecase(gateway.NewGateway(f, cms), nil, opts...), f, cms
}

func TestUsecase_Decompress_ClosesArchive(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs())

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	assert.Equal(t, 1, f.opened)
	assert.Equal(t, 1, f.closed, "archive reader must be closed on success")
	assert.Equal(t, 1, f.resets, "attempt counter must be reset when extraction finishes")
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusDone}, cms.statuses)
}

func TestUsecase_Decompress_ClosesArchiveOnError(t *testing.T) {
	fs := afero.NewMemMapFs()
	require.NoError(t, afero.WriteFile(fs, "broken.zip", []byte("this is not a zip archive"), 0o644))
	uc, f, cms := newSpyUsecase(t, fs)

	// a failed extraction is acknowledged (nil) and reported as failed
	require.NoError(t, uc.Decompress(context.Background(), "aaa", "broken.zip"))

	assert.Equal(t, 1, f.opened)
	assert.Equal(t, 1, f.closed, "archive reader must be closed on error")
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusFailed}, cms.statuses)
}

func TestUsecase_Decompress_ClosesArchiveOnCancel(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs())
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	// a canceled extraction is returned so that Pub/Sub redelivers it
	err := uc.Decompress(ctx, "aaa", "test.zip")
	assert.ErrorIs(t, err, context.Canceled)

	assert.Equal(t, 1, f.closed, "archive reader must be closed on cancel")
	assert.Equal(t, 0, f.resets, "attempt counter must be kept for redelivery")
	assert.Empty(t, cms.statuses)
}

func TestUsecase_Decompress_TooLarge(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs())
	f.readErr = fmt.Errorf("%w: size=11 limit=10", gateway.ErrFileTooLarge)

	// acknowledged, so the message is not redelivered
	require.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusFailed}, cms.statuses)
}

func TestUsecase_Decompress_TooManyAttempts(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs(), WithMaxDecompressAttempts(2))
	// two earlier deliveries were killed without making progress
	f.attempt = 2

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	assert.Equal(t, 0, f.reads, "archive must not be opened again")
	assert.Equal(t, 1, f.resets)
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusFailed}, cms.statuses)
}

func TestUsecase_Decompress_AttemptsBelowLimit(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs(), WithMaxDecompressAttempts(2))
	f.attempt = 1

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	assert.Equal(t, 1, f.reads)
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusDone}, cms.statuses)
}

func TestUsecase_Decompress_StartAttemptError(t *testing.T) {
	uc, f, cms := newSpyUsecase(t, mockFs())
	f.attemptErr = errors.New("gcs unavailable")

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "test.zip"))

	assert.Equal(t, 0, f.reads)
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusFailed}, cms.statuses)
}

func TestNewUsecase_MaxDecompressAttempts(t *testing.T) {
	assert.Equal(t, DefaultMaxDecompressAttempts, NewUsecase(nil, nil).maxDecompressAttempts)
	assert.Equal(t, DefaultMaxDecompressAttempts, NewUsecase(nil, nil, WithMaxDecompressAttempts(0)).maxDecompressAttempts)
	assert.Equal(t, 5, NewUsecase(nil, nil, WithMaxDecompressAttempts(5)).maxDecompressAttempts)
}

var _ io.Closer = (*closeSpy)(nil)
