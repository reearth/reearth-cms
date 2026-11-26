package publicapi

import (
	"bufio"
	"context"
	"errors"
	"io"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/reearth/reearthx/log"
)

// streamBufferSize is the amount of output held back before the response is
// committed. Errors that happen before this much has been written still get a
// normal error response.
const streamBufferSize = 32 * 1024

// streamResponseWriter writes straight to the HTTP response. The status code
// and content type are only sent on the first write, so nothing is committed
// until there is actual output.
type streamResponseWriter struct {
	c           *echo.Context
	contentType string
	committed   bool
	// writeErr is the first error from writing to the client, e.g. when it
	// closed the connection.
	writeErr error
}

func (w *streamResponseWriter) commit() {
	if w.committed {
		return
	}
	w.committed = true
	res := w.c.Response()
	if res.Header().Get(echo.HeaderContentType) == "" {
		res.Header().Set(echo.HeaderContentType, w.contentType)
	}
	res.WriteHeader(http.StatusOK)
}

func (w *streamResponseWriter) Write(p []byte) (int, error) {
	w.commit()
	n, err := w.c.Response().Write(p)
	if err != nil && w.writeErr == nil {
		w.writeErr = err
	}
	return n, err
}

// stream runs export and streams its output to the client as a 200 response
// with the given content type, without holding the whole body in memory.
//
// If export fails before the response is committed, the error is returned
// unchanged so the caller can send its usual error response. If it fails
// after the status and part of the body were already sent, the status can no
// longer be changed: the error is logged and the connection is aborted, so
// the client sees a broken transfer instead of a truncated 200 response that
// looks complete.
func stream(c *echo.Context, contentType string, export func(io.Writer) error) error {
	sw := &streamResponseWriter{c: c, contentType: contentType}
	bw := bufio.NewWriterSize(sw, streamBufferSize)

	err := export(bw)
	if err == nil {
		err = bw.Flush()
	}

	if err == nil {
		sw.commit() // empty body
		return nil
	}

	if !sw.committed {
		// nothing was sent yet; drop the buffered output
		return err
	}

	ctx := c.Request().Context()
	if sw.writeErr != nil || errors.Is(err, context.Canceled) || ctx.Err() != nil {
		// writing to the client failed or the client went away (the request
		// context is not always canceled yet when a write fails); there is
		// nobody to tell
		return nil
	}

	log.Errorfc(ctx, "publicapi: export failed after the response was committed: %v", err)
	panic(http.ErrAbortHandler)
}
