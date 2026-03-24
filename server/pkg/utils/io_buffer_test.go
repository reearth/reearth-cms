package utils

import (
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBufferRW_ReadWriteSeek(t *testing.T) {
	data := []byte("hello world")
	brw := NewBufferRW(data)

	// Read first 5 bytes
	buf := make([]byte, 5)
	n, err := brw.Read(buf)
	assert.NoError(t, err)
	assert.Equal(t, 5, n)
	assert.Equal(t, "hello", string(buf))

	// Seek to start
	pos, err := brw.Seek(0, io.SeekStart)
	assert.NoError(t, err)
	assert.Equal(t, int64(0), pos)

	// Write "HEY" at start
	n, err = brw.Write([]byte("HEY"))
	assert.NoError(t, err)
	assert.Equal(t, 3, n)

	// Seek to start and read all
	_, _ = brw.Seek(0, io.SeekStart)
	buf = make([]byte, len(data))
	n, err = brw.Read(buf)
	assert.True(t, err == nil || err == io.EOF)
	got := string(buf[:n])
	want := "HEYlo world"
	assert.Equal(t, want, got)
}

func TestBufferRW_SeekModes(t *testing.T) {
	brw := NewBufferRW([]byte("abcde"))

	// Seek from current
	_, _ = brw.Read(make([]byte, 2)) // pos = 2
	pos, err := brw.Seek(1, io.SeekCurrent)
	assert.NoError(t, err)
	assert.Equal(t, int64(3), pos)

	// Seek from end
	pos, err = brw.Seek(-1, io.SeekEnd)
	assert.NoError(t, err)
	assert.Equal(t, int64(4), pos)

	// Seek negative
	_, err = brw.Seek(-10, io.SeekStart)
	assert.Error(t, err)

	// Invalid whence
	_, err = brw.Seek(0, 99)
	assert.Error(t, err)
}

func TestBufferRW_Close(t *testing.T) {
	brw := NewBufferRW([]byte("abc"))
	err := brw.Close()
	assert.NoError(t, err)

	_, err = brw.Read(make([]byte, 1))
	assert.Error(t, err)

	_, err = brw.Write([]byte("x"))
	assert.Error(t, err)
}

func TestBufferRW_WriteBeyondEnd(t *testing.T) {
	brw := NewBufferRW([]byte("abc"))
	_, _ = brw.Seek(5, io.SeekStart)
	n, err := brw.Write([]byte("z"))
	assert.NoError(t, err)
	assert.Equal(t, 1, n)

	_, _ = brw.Seek(0, io.SeekStart)
	buf := make([]byte, 6)
	n, _ = brw.Read(buf)
	want := "abc\x00\x00z"
	got := string(buf[:n])
	assert.Equal(t, want, got)
}
