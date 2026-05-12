package utils

import (
	"bytes"
	"errors"
	"io"
)

// BufferRW implements io.Reader, io.Writer, io.Seeker, io.Closer
type BufferRW struct {
	buffer *bytes.Buffer
	pos    int64
	closed bool
}

// NewBufferRW creates a new BufferRW
func NewBufferRW(data []byte) *BufferRW {
	return &BufferRW{
		buffer: bytes.NewBuffer(data),
		pos:    0,
		closed: false,
	}
}

// Read implements io.Reader
func (brw *BufferRW) Read(p []byte) (n int, err error) {
	if brw.closed {
		return 0, errors.New("read from closed buffer")
	}
	data := brw.buffer.Bytes()
	if brw.pos >= int64(len(data)) {
		return 0, io.EOF
	}
	n = copy(p, data[brw.pos:])
	brw.pos += int64(n)
	return n, nil
}

// Write implements io.Writer
func (brw *BufferRW) Write(p []byte) (n int, err error) {
	if brw.closed {
		return 0, errors.New("write to closed buffer")
	}
	buf := brw.buffer.Bytes()
	if int(brw.pos) > len(buf) {
		padding := make([]byte, int(brw.pos)-len(buf))
		brw.buffer.Write(padding)
		buf = brw.buffer.Bytes()
	}

	if int(brw.pos)+len(p) > len(buf) {
		buf = append(buf[:brw.pos], p...)
	} else {
		copy(buf[brw.pos:], p)
	}
	brw.buffer = bytes.NewBuffer(buf)
	brw.pos += int64(len(p))
	return len(p), nil
}

// Seek implements io.Seeker
func (brw *BufferRW) Seek(offset int64, whence int) (int64, error) {
	var newPos int64

	switch whence {
	case io.SeekStart:
		newPos = offset
	case io.SeekCurrent:
		newPos = brw.pos + offset
	case io.SeekEnd:
		newPos = int64(len(brw.buffer.Bytes())) + offset
	default:
		return 0, errors.New("invalid seek whence")
	}

	if newPos < 0 {
		return 0, errors.New("negative position")
	}

	brw.pos = newPos
	return newPos, nil
}

// Close implements io.Closer
func (brw *BufferRW) Close() error {
	brw.closed = true
	return nil
}
