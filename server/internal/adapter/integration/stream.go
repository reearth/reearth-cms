package integration

import (
	"context"
	"errors"
	"io"
	"net/http"
	"sync"

	"github.com/reearth/reearthx/log"
)

// streamExport runs export in a goroutine and returns a reader for its output.
//
// It waits until export either writes its first bytes or returns. An error
// returned before any output (e.g. not found, no geometry field) is returned
// here, so the handler can still answer with a proper error status instead
// of committing a 200 response with an empty body.
//
// Errors after output has started can no longer change the status code. The
// returned reader then aborts the connection (see abortOnErrorReader).
func streamExport(ctx context.Context, export func(io.Writer) error) (io.ReadCloser, error) {
	pr, pw := io.Pipe()
	sw := &startSignalWriter{w: pw, started: make(chan struct{})}
	done := make(chan error, 1)

	go func() {
		err := export(sw)
		done <- err
		_ = pw.CloseWithError(err)
	}()

	select {
	case <-sw.started:
	case err := <-done:
		if err != nil {
			_ = pr.Close()
			return nil, err
		}
	}

	return &abortOnErrorReader{ctx: ctx, r: pr}, nil
}

// startSignalWriter closes started right before the first write.
type startSignalWriter struct {
	w       io.Writer
	once    sync.Once
	started chan struct{}
}

func (w *startSignalWriter) Write(p []byte) (int, error) {
	w.once.Do(func() { close(w.started) })
	return w.w.Write(p)
}

// abortOnErrorReader aborts the HTTP response when the export fails after the
// response was committed, so the client sees a broken transfer instead of a
// truncated 200 response that looks complete.
type abortOnErrorReader struct {
	ctx context.Context
	r   *io.PipeReader
}

func (r *abortOnErrorReader) Read(p []byte) (int, error) {
	n, err := r.r.Read(p)
	if err != nil && !errors.Is(err, io.EOF) {
		if errors.Is(err, context.Canceled) || r.ctx.Err() != nil {
			// the client went away; there is nobody to tell
			return n, err
		}
		_ = r.r.Close()
		log.Errorfc(r.ctx, "integration: export failed after the response was committed: %v", err)
		panic(http.ErrAbortHandler)
	}
	return n, err
}

func (r *abortOnErrorReader) Close() error {
	return r.r.Close()
}
