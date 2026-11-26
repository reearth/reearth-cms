// Package rangereader provides an io.ReaderAt over a remote object that is
// read with ranged requests, keeping only a small, fixed number of blocks in
// memory. Memory use does not grow with the size of the object.
package rangereader

import (
	"container/list"
	"context"
	"errors"
	"fmt"
	"io"
	"sync"
)

const (
	// DefaultBlockSize is the size of each ranged request and cached block.
	DefaultBlockSize int64 = 8 * 1024 * 1024
	// DefaultMaxBlocks is the number of blocks kept in memory at most.
	DefaultMaxBlocks = 4
)

var (
	ErrClosed         = errors.New("rangereader: reader is closed")
	ErrNegativeOffset = errors.New("rangereader: negative offset")
)

// OpenFunc opens a reader for length bytes of the object starting at off.
// The returned reader is always closed by ReaderAt before ReadAt returns.
type OpenFunc func(ctx context.Context, off, length int64) (io.ReadCloser, error)

type Option func(*ReaderAt)

// WithBlockSize sets the size of each ranged request. Values <= 0 are ignored.
func WithBlockSize(n int64) Option {
	return func(r *ReaderAt) {
		if n > 0 {
			r.blockSize = n
		}
	}
}

// WithMaxBlocks sets how many blocks are cached at most. Values <= 0 are ignored.
func WithMaxBlocks(n int) Option {
	return func(r *ReaderAt) {
		if n > 0 {
			r.maxBlocks = n
		}
	}
}

// ReaderAt implements io.ReaderAt and io.Closer on top of ranged reads.
// The cache holds at most MaxBlocks*BlockSize bytes. It is safe for
// concurrent use.
type ReaderAt struct {
	ctx       context.Context
	open      OpenFunc
	size      int64
	blockSize int64
	maxBlocks int

	mu     sync.Mutex
	lru    *list.List // of *block, most recently used at the front
	index  map[int64]*list.Element
	closed bool
}

type block struct {
	idx  int64
	data []byte
}

// New returns a ReaderAt for an object of the given size. ctx is used for
// every ranged request, because io.ReaderAt has no context parameter.
func New(ctx context.Context, open OpenFunc, size int64, opts ...Option) *ReaderAt {
	r := &ReaderAt{
		ctx:       ctx,
		open:      open,
		size:      size,
		blockSize: DefaultBlockSize,
		maxBlocks: DefaultMaxBlocks,
		lru:       list.New(),
		index:     map[int64]*list.Element{},
	}
	for _, o := range opts {
		o(r)
	}
	return r
}

// Size returns the size of the underlying object.
func (r *ReaderAt) Size() int64 { return r.size }

// MaxResidentBytes returns the upper bound of bytes the cache can hold.
func (r *ReaderAt) MaxResidentBytes() int64 { return r.blockSize * int64(r.maxBlocks) }

// ResidentBytes returns the bytes currently held by the cache.
func (r *ReaderAt) ResidentBytes() int64 {
	r.mu.Lock()
	defer r.mu.Unlock()
	var n int64
	for e := r.lru.Front(); e != nil; e = e.Next() {
		n += int64(cap(e.Value.(*block).data))
	}
	return n
}

func (r *ReaderAt) ReadAt(p []byte, off int64) (int, error) {
	if off < 0 {
		return 0, ErrNegativeOffset
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.closed {
		return 0, ErrClosed
	}
	if off >= r.size {
		return 0, io.EOF
	}

	n := 0
	for n < len(p) && off < r.size {
		b, err := r.block(off / r.blockSize)
		if err != nil {
			return n, err
		}
		c := copy(p[n:], b.data[off-b.idx*r.blockSize:])
		n += c
		off += int64(c)
	}
	if n < len(p) {
		return n, io.EOF
	}
	return n, nil
}

// block returns the cached block idx, fetching it if needed. r.mu is held.
func (r *ReaderAt) block(idx int64) (*block, error) {
	if e, ok := r.index[idx]; ok {
		r.lru.MoveToFront(e)
		return e.Value.(*block), nil
	}

	start := idx * r.blockSize
	length := min(r.blockSize, r.size-start)

	// Reuse the buffer of the least recently used block once the cache is
	// full, so the cache never holds more than maxBlocks buffers.
	var buf []byte
	if r.lru.Len() >= r.maxBlocks {
		e := r.lru.Back()
		old := e.Value.(*block)
		r.lru.Remove(e)
		delete(r.index, old.idx)
		buf = old.data[:0]
	}
	if int64(cap(buf)) < length {
		buf = make([]byte, length, r.blockSize)
	}
	buf = buf[:length]

	if err := r.fetch(start, buf); err != nil {
		return nil, err
	}

	b := &block{idx: idx, data: buf}
	r.index[idx] = r.lru.PushFront(b)
	return b, nil
}

func (r *ReaderAt) fetch(start int64, buf []byte) (err error) {
	rc, err := r.open(r.ctx, start, int64(len(buf)))
	if err != nil {
		return fmt.Errorf("rangereader: open range off=%d len=%d: %w", start, len(buf), err)
	}
	defer func() {
		if cerr := rc.Close(); cerr != nil && err == nil {
			err = fmt.Errorf("rangereader: close range off=%d: %w", start, cerr)
		}
	}()
	if _, err := io.ReadFull(rc, buf); err != nil {
		return fmt.Errorf("rangereader: read range off=%d len=%d: %w", start, len(buf), err)
	}
	return nil
}

// Close releases the cache. Ranged readers are closed after every fetch, so
// nothing else stays open. Close is idempotent.
func (r *ReaderAt) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.closed = true
	r.lru.Init()
	r.index = map[int64]*list.Element{}
	return nil
}
