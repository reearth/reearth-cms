package integration

import (
	"bufio"
	"context"
	"errors"
	"io"
	"net/http"
	"sync"

	"github.com/reearth/reearthx/log"
)

// streamBufferSize is the amount of output held back before the response is
// started. Exporters write their opening bytes (e.g. the start of the GeoJSON
// document) before the first database query, so without this buffer a failing
// query would only be noticed after the 200 status was sent.
const streamBufferSize = 32 * 1024

// streamExport runs export in a goroutine and returns a reader for its output.
//
// The output is buffered, and the function waits until the first
// streamBufferSize bytes are passed on or export returns. An error returned
// before that (e.g. not found, no geometry field, a failed first query) is
// returned here, so the handler can still answer with a proper error status
// instead of committing a 200 response.
//
// Errors after output has started can no longer change the status code. The
// returned reader then aborts the connection (see abortOnErrorReader).
func streamExport(ctx context.Context, export func(io.Writer) error) (io.ReadCloser, error) {
	pr, pw := io.Pipe()
	sw := &startSignalWriter{w: pw, started: make(chan struct{})}
	done := make(chan error, 1)

	go func() {
		bw := bufio.NewWriterSize(sw, streamBufferSize)
		err := export(bw)
		if err == nil {
			err = bw.Flush()
		}
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

// startSignalWriter closes started right before the first write to the pipe,
// i.e. when the response is about to start.
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
