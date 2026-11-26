package rangereader

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"runtime"
	"sync/atomic"
	"testing"
)

// countingOpener serves ranges of src and counts opened and closed readers.
type countingOpener struct {
	src     io.ReaderAt
	opened  atomic.Int64
	closed  atomic.Int64
	openErr error
	readErr error
}

func (o *countingOpener) open(_ context.Context, off, length int64) (io.ReadCloser, error) {
	if o.openErr != nil {
		return nil, o.openErr
	}
	o.opened.Add(1)
	var r io.Reader = io.NewSectionReader(o.src, off, length)
	if o.readErr != nil {
		r = io.MultiReader(io.LimitReader(r, length/2), errReader{o.readErr})
	}
	return &trackedReader{Reader: r, onClose: func() { o.closed.Add(1) }}, nil
}

type errReader struct{ err error }

func (e errReader) Read([]byte) (int, error) { return 0, e.err }

type trackedReader struct {
	io.Reader
	onClose func()
	done    bool
}

func (t *trackedReader) Close() error {
	if !t.done {
		t.done = true
		t.onClose()
	}
	return nil
}

func randomBytes(n int, seed int64) []byte {
	b := make([]byte, n)
	_, _ = rand.New(rand.NewSource(seed)).Read(b)
	return b
}

func TestReaderAt_MatchesSource(t *testing.T) {
	data := randomBytes(10*1024+123, 1)
	o := &countingOpener{src: bytes.NewReader(data)}
	r := New(context.Background(), o.open, int64(len(data)), WithBlockSize(1024), WithMaxBlocks(2))
	want := bytes.NewReader(data)

	rnd := rand.New(rand.NewSource(2))
	for i := 0; i < 2000; i++ {
		off := rnd.Int63n(int64(len(data)) + 100)
		p := make([]byte, rnd.Intn(3000))
		q := make([]byte, len(p))
		n, err := r.ReadAt(p, off)
		wn, werr := want.ReadAt(q, off)
		if n != wn || !bytes.Equal(p[:n], q[:wn]) {
			t.Fatalf("off=%d len=%d: got n=%d want n=%d", off, len(p), n, wn)
		}
		if (err == nil) != (werr == nil) || (err != nil && !errors.Is(err, io.EOF)) {
			t.Fatalf("off=%d len=%d: got err=%v want err=%v", off, len(p), err, werr)
		}
		if got, max := r.ResidentBytes(), r.MaxResidentBytes(); got > max {
			t.Fatalf("resident %d > max %d", got, max)
		}
	}
	if o.opened.Load() != o.closed.Load() {
		t.Fatalf("opened %d readers but closed %d", o.opened.Load(), o.closed.Load())
	}
	if err := r.Close(); err != nil {
		t.Fatal(err)
	}
}

func TestReaderAt_ClosesReaderOnReadError(t *testing.T) {
	data := randomBytes(4096, 3)
	o := &countingOpener{src: bytes.NewReader(data), readErr: errors.New("boom")}
	r := New(context.Background(), o.open, int64(len(data)), WithBlockSize(1024))

	_, err := r.ReadAt(make([]byte, 10), 0)
	if err == nil || !errors.Is(err, o.readErr) {
		t.Fatalf("expected read error, got %v", err)
	}
	if o.opened.Load() != 1 || o.closed.Load() != 1 {
		t.Fatalf("opened=%d closed=%d, want 1/1", o.opened.Load(), o.closed.Load())
	}
	// A failed block is not cached: the next read retries.
	_, _ = r.ReadAt(make([]byte, 10), 0)
	if o.opened.Load() != 2 || o.closed.Load() != 2 {
		t.Fatalf("opened=%d closed=%d, want 2/2", o.opened.Load(), o.closed.Load())
	}
}

func TestReaderAt_OpenError(t *testing.T) {
	o := &countingOpener{openErr: errors.New("no such object")}
	r := New(context.Background(), o.open, 100)
	if _, err := r.ReadAt(make([]byte, 1), 0); !errors.Is(err, o.openErr) {
		t.Fatalf("expected open error, got %v", err)
	}
}

func TestReaderAt_EdgeCases(t *testing.T) {
	data := []byte("hello world")
	o := &countingOpener{src: bytes.NewReader(data)}
	r := New(context.Background(), o.open, int64(len(data)), WithBlockSize(4))

	if _, err := r.ReadAt(make([]byte, 1), -1); !errors.Is(err, ErrNegativeOffset) {
		t.Fatalf("negative offset: got %v", err)
	}
	if n, err := r.ReadAt(make([]byte, 1), int64(len(data))); n != 0 || err != io.EOF {
		t.Fatalf("read at size: got %d, %v", n, err)
	}
	if n, err := r.ReadAt(nil, 0); n != 0 || err != nil {
		t.Fatalf("empty read: got %d, %v", n, err)
	}
	if err := r.Close(); err != nil {
		t.Fatal(err)
	}
	if err := r.Close(); err != nil {
		t.Fatal("Close must be idempotent")
	}
	if _, err := r.ReadAt(make([]byte, 1), 0); !errors.Is(err, ErrClosed) {
		t.Fatalf("read after close: got %v", err)
	}
	if r.ResidentBytes() != 0 {
		t.Fatal("cache not released on Close")
	}
}

// TestReaderAt_LargeZip extracts a zip that is many times larger than the
// cache and checks that memory use stays bounded and output is unchanged.
func TestReaderAt_LargeZip(t *testing.T) {
	if testing.Short() {
		t.Skip("large archive test skipped in -short mode")
	}

	const (
		blockSize = 1 << 20 // 1 MiB
		maxBlocks = 4
		bigFiles  = 3
		bigSize   = 40 << 20 // 3 x 40 MiB = 120 MiB, 30x the cache
		smallN    = 500
	)

	zipPath := filepath.Join(t.TempDir(), "large.zip")
	want := map[string][32]byte{}
	{
		f, err := os.Create(zipPath)
		if err != nil {
			t.Fatal(err)
		}
		zw := zip.NewWriter(f)
		chunk := randomBytes(1<<20, 4)
		for i := 0; i < bigFiles; i++ {
			name := fmt.Sprintf("big/file%d.bin", i)
			w, err := zw.CreateHeader(&zip.FileHeader{Name: name, Method: zip.Store})
			if err != nil {
				t.Fatal(err)
			}
			h := sha256.New()
			for written := 0; written < bigSize; written += len(chunk) {
				chunk[0] = byte(i) // make files differ
				_, _ = h.Write(chunk)
				if _, err := w.Write(chunk); err != nil {
					t.Fatal(err)
				}
			}
			want[name] = [32]byte(h.Sum(nil))
		}
		for i := 0; i < smallN; i++ {
			name := fmt.Sprintf("small/%03d.txt", i)
			body := []byte(fmt.Sprintf("small file %d", i))
			w, err := zw.Create(name)
			if err != nil {
				t.Fatal(err)
			}
			_, _ = w.Write(body)
			want[name] = sha256.Sum256(body)
		}
		if err := zw.Close(); err != nil {
			t.Fatal(err)
		}
		if err := f.Close(); err != nil {
			t.Fatal(err)
		}
	}

	src, err := os.Open(zipPath)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = src.Close() }()
	st, _ := src.Stat()

	o := &countingOpener{src: src}
	r := New(context.Background(), o.open, st.Size(), WithBlockSize(blockSize), WithMaxBlocks(maxBlocks))

	runtime.GC()
	var before runtime.MemStats
	runtime.ReadMemStats(&before)

	zr, err := zip.NewReader(r, r.Size())
	if err != nil {
		t.Fatal(err)
	}
	buf := make([]byte, 32*1024)
	for _, zf := range zr.File {
		rc, err := zf.Open()
		if err != nil {
			t.Fatal(err)
		}
		h := sha256.New()
		if _, err := io.CopyBuffer(h, rc, buf); err != nil {
			t.Fatal(err)
		}
		_ = rc.Close()
		if got := [32]byte(h.Sum(nil)); got != want[zf.Name] {
			t.Fatalf("content mismatch for %s", zf.Name)
		}
		if res := r.ResidentBytes(); res > r.MaxResidentBytes() {
			t.Fatalf("resident %d > max %d", res, r.MaxResidentBytes())
		}
	}
	if len(zr.File) != len(want) {
		t.Fatalf("got %d entries, want %d", len(zr.File), len(want))
	}

	var after runtime.MemStats
	runtime.ReadMemStats(&after)
	allocated := after.TotalAlloc - before.TotalAlloc
	// Everything allocated while extracting (cache, zip directory, buffers)
	// must stay far below the archive size.
	if limit := uint64(st.Size() / 4); allocated > limit {
		t.Fatalf("allocated %d bytes while extracting a %d byte archive (limit %d)", allocated, st.Size(), limit)
	}

	if err := r.Close(); err != nil {
		t.Fatal(err)
	}
	if o.opened.Load() != o.closed.Load() {
		t.Fatalf("opened %d readers but closed %d", o.opened.Load(), o.closed.Load())
	}
	t.Logf("archive=%d bytes, ranged reads=%d, allocated=%d bytes", st.Size(), o.opened.Load(), allocated)
}
