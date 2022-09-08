package zip

import (
	"archive/zip"
	"bytes"
	"io"
	"log"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Buffer implements io.ReadAtCloser and io.WriteCloser
type Buffer struct {
	bytes.Buffer
}

func (*Buffer) Close() error {
	return nil
}

func TestNewUnzipper(t *testing.T) {
	zf, err := os.Open("testdata/test.zip")
	require.NoError(t, err)
	fInfo, err := zf.Stat()
	require.NoError(t, err)

	wFn := func(name string) (io.WriteCloser, error) {
		return &Buffer{bytes.Buffer{}}, nil
	}
	r, err := zip.NewReader(zf, fInfo.Size())
	assert.NoError(t, err)
	_, err = NewUnzipper(r, wFn)
	assert.NoError(t, err)
}

func TestUnzipper_Unzip(t *testing.T) {
	zf, err := os.Open("testdata/test.zip")
	require.NoError(t, err)

	fInfo, err := zf.Stat()
	if err != nil {
		t.Fatal(err)
	}

	expectedFiles := map[string]*Buffer{"test1.txt": {*bytes.NewBufferString("hello1")}, "test2.txt": {*bytes.NewBufferString("hello2")}}

	var buf1 bytes.Buffer
	var buf2 bytes.Buffer
	//map of buffers which will keep unzipped data
	files := map[string]*Buffer{"test1.txt": {buf1}, "test2.txt": {buf2}}
	wFn := func(name string) (io.WriteCloser, error) {
		return files[name], nil
	}

	r, err := zip.NewReader(zf, fInfo.Size())
	require.NoError(t, err)
	uz, err := NewUnzipper(r, wFn)
	require.NoError(t, err)

	log.Default().Print(expectedFiles, uz)
	err = uz.Unzip()
	assert.NoError(t, err)
	for k, v := range files {
		assert.Equal(t, v.Bytes(), expectedFiles[k].Bytes())
	}

}
