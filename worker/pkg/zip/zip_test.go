package zip

import (
	"archive/zip"
	"bytes"
	"errors"
	"io"
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
	assert.NoError(t, err)

	fInfo, err := zf.Stat()
	if err != nil {
		t.Fatal(err)
	}

	expectedFiles := map[string][]byte{
		"test1.txt": []byte("hello1"),
		"test2.txt": []byte("hello2"),
	}

	// map of buffers which will keep unzipped data
	files := map[string]*Buffer{
		"test1.txt": {bytes.Buffer{}},
		"test2.txt": {bytes.Buffer{}},
	}

	// Normal Scenario
	r, err := zip.NewReader(zf, fInfo.Size())
	require.NoError(t, err)
	uz, err := NewUnzipper(r, func(name string) (io.WriteCloser, error) {
		return files[name], nil
	})
	require.NoError(t, err)

	assert.NoError(t, uz.Unzip())
	for k, v := range files {
		assert.Equal(t, v.Bytes(), expectedFiles[k])
	}

	// Exception: test if wFn's error is same as what Unzip returns
	uz, err = NewUnzipper(r, func(name string) (io.WriteCloser, error) {
		return nil, errors.New("test")
	})
	require.NoError(t, err)
	assert.Equal(t, errors.New("test"), uz.Unzip())
}
