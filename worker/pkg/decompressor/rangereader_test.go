package decompressor

import (
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"github.com/reearth/reearth-cms/worker/pkg/rangereader"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestDecompress_WithRangeReader checks that zip and 7z archives read through
// the bounded-memory range reader (as the GCS gateway does) give the same
// output as reading them from a file, and that every ranged reader is closed.
func TestDecompress_WithRangeReader(t *testing.T) {
	for _, ext := range []string{"zip", "7z"} {
		t.Run(ext, func(t *testing.T) {
			data, err := os.ReadFile("testdata/test." + ext)
			require.NoError(t, err)

			opened, closed := 0, 0
			open := func(_ context.Context, off, length int64) (io.ReadCloser, error) {
				opened++
				return &onClose{
					Reader: io.NewSectionReader(bytes.NewReader(data), off, length),
					fn:     func() { closed++ },
				}, nil
			}
			// tiny blocks force many ranged reads and evictions
			r := rangereader.New(context.Background(), open, int64(len(data)),
				rangereader.WithBlockSize(16), rangereader.WithMaxBlocks(2))

			files := map[string]*Buffer{}
			uz, err := New(r, r.Size(), ext, func(name string) (io.WriteCloser, error) {
				b := &Buffer{}
				files[name] = b
				return b, nil
			})
			require.NoError(t, err)
			require.NoError(t, uz.Decompress(context.Background(), 0, func(context.Context, int64) error { return nil }))
			require.NoError(t, r.Close())

			assert.Equal(t, "hello1", files["test1.txt"].String())
			assert.Equal(t, "hello2", files["test2.txt"].String())
			assert.Len(t, files, 2)
			assert.Positive(t, opened)
			assert.Equal(t, opened, closed, "every ranged reader must be closed")
		})
	}
}

type onClose struct {
	io.Reader
	fn func()
}

func (o *onClose) Close() error {
	o.fn()
	return nil
}
