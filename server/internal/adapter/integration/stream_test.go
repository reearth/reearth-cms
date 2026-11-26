package integration

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/reearth/reearthx/rerror"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var errDBFailed = errors.New("db failed")

func writeChunks(w io.Writer, chunk []byte, n int) error {
	for range n {
		if _, err := w.Write(chunk); err != nil {
			return err
		}
	}
	return nil
}

func TestStreamExport(t *testing.T) {
	t.Parallel()

	// three chunks are more than streamBufferSize
	chunk := bytes.Repeat([]byte("a"), 16*1024)

	t.Run("error before any output is returned to the handler", func(t *testing.T) {
		t.Parallel()

		body, err := streamExport(context.Background(), func(io.Writer) error {
			return rerror.ErrNotFound
		})

		assert.ErrorIs(t, err, rerror.ErrNotFound)
		assert.Nil(t, body)
	})

	t.Run("output is streamed in full", func(t *testing.T) {
		t.Parallel()

		body, err := streamExport(context.Background(), func(w io.Writer) error {
			return writeChunks(w, chunk, 3)
		})
		require.NoError(t, err)
		defer func() { _ = body.Close() }()

		got, err := io.ReadAll(body)
		require.NoError(t, err)
		assert.Equal(t, bytes.Repeat(chunk, 3), got)
	})

	t.Run("success without output returns an empty body", func(t *testing.T) {
		t.Parallel()

		body, err := streamExport(context.Background(), func(io.Writer) error { return nil })
		require.NoError(t, err)
		defer func() { _ = body.Close() }()

		got, err := io.ReadAll(body)
		require.NoError(t, err)
		assert.Empty(t, got)
	})

	t.Run("error after a small opening write is still returned to the handler", func(t *testing.T) {
		t.Parallel()

		// like the GeoJSON exporter: it writes the start of the document,
		// then the first database query fails
		body, err := streamExport(context.Background(), func(w io.Writer) error {
			if _, err := w.Write([]byte(`{"type":"FeatureCollection","features":[`)); err != nil {
				return err
			}
			return errDBFailed
		})

		assert.ErrorIs(t, err, errDBFailed)
		assert.Nil(t, body)
	})

	t.Run("error after output has started aborts the response", func(t *testing.T) {
		t.Parallel()

		body, err := streamExport(context.Background(), func(w io.Writer) error {
			if err := writeChunks(w, chunk, 3); err != nil {
				return err
			}
			return errDBFailed
		})
		require.NoError(t, err)
		defer func() { _ = body.Close() }()

		assert.PanicsWithValue(t, http.ErrAbortHandler, func() {
			_, _ = io.ReadAll(body)
		})
	})

	t.Run("client disconnect after output has started does not panic", func(t *testing.T) {
		t.Parallel()
		ctx, cancel := context.WithCancel(context.Background())

		body, err := streamExport(ctx, func(w io.Writer) error {
			if err := writeChunks(w, chunk, 3); err != nil {
				return err
			}
			cancel()
			return ctx.Err()
		})
		require.NoError(t, err)
		defer func() { _ = body.Close() }()

		assert.NotPanics(t, func() {
			_, err = io.ReadAll(body)
		})
		assert.ErrorIs(t, err, context.Canceled)
	})

	t.Run("closing the body stops the export", func(t *testing.T) {
		t.Parallel()

		done := make(chan error, 1)
		body, err := streamExport(context.Background(), func(w io.Writer) error {
			for {
				if _, err := w.Write(chunk); err != nil {
					done <- err
					return err
				}
			}
		})
		require.NoError(t, err)

		_, err = body.Read(make([]byte, 1024))
		require.NoError(t, err)
		require.NoError(t, body.Close())

		select {
		case err := <-done:
			assert.ErrorIs(t, err, io.ErrClosedPipe)
		case <-time.After(5 * time.Second):
			t.Fatal("export did not stop after the body was closed")
		}
	})
}
