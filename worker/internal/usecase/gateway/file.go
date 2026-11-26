package gateway

import (
	"context"
	"errors"
	"io"
)

var (
	ErrInvalidFile        = errors.New("invalid file")
	ErrNotFound           = errors.New("not found")
	ErrFailedToUploadFile = errors.New("failed to upload file")
	ErrFileTooLarge       = errors.New("file too large")
	ErrFailedToRemoveFile = errors.New("failed to remove file")
)

type ReadAtCloser interface {
	io.ReaderAt
	io.Closer
}

type File interface {
	// Read opens the archive at path for random access. It returns the reader,
	// the archive size and the number of entries already extracted. The caller
	// must close the reader. It returns ErrFileTooLarge when the archive is
	// above the configured size limit.
	Read(ctx context.Context, path string) (ReadAtCloser, int64, int64, error)
	// WriteProceeded records extraction progress. Progress also resets the
	// attempt counter, because the previous attempt was not stuck.
	WriteProceeded(ctx context.Context, path string, proceeded int64) error
	// StartAttempt records a new extraction attempt for the archive at path
	// and returns how many attempts have been made without progress,
	// including this one.
	StartAttempt(ctx context.Context, path string) (int, error)
	// ResetAttempts clears the attempt counter once extraction has finished.
	ResetAttempts(ctx context.Context, path string) error
	Upload(ctx context.Context, name string) (io.WriteCloser, error)
}
