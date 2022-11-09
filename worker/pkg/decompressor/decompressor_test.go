package decompressor

import (
	"bytes"
	"errors"
	"io"
	"os"
	"testing"

	"github.com/samber/lo"
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
	zf := lo.Must(os.Open("testdata/test.zip"))
	fInfo := lo.Must(zf.Stat())

	wFn := func(name string) (io.WriteCloser, error) {
		return &Buffer{bytes.Buffer{}}, nil
	}
	_, err := New(zf, fInfo.Size(), "zip", wFn)
	assert.NoError(t, err)

	f := lo.Must(os.Open("testdata/test1.txt"))
	fInfo2 := lo.Must(f.Stat())
	_, err2 := New(f, fInfo2.Size(), "txt", wFn)
	// txt is not unsupported
	assert.Same(t, ErrUnsupportedExtention, err2)
}

func TestDecompressor_Decompress(t *testing.T) {
	zf, err := os.Open("testdata/test.zip")
	require.NoError(t, err)

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

	// normal scenario
	uz, err := New(zf, fInfo.Size(), "zip", func(name string) (io.WriteCloser, error) {
		return files[name], nil
	})
	require.NoError(t, err)

	assert.NoError(t, uz.Decompress())
	for k, v := range files {
		assert.Equal(t, v.Bytes(), expectedFiles[k])
	}

	// exception: test if  wFn's error is same as what Unzip returns
	uz, err = New(zf, fInfo.Size(), "zip", func(name string) (io.WriteCloser, error) {
		return nil, errors.New("test")
	})
	require.NoError(t, err)
	assert.Equal(t, errors.New("test"), uz.Decompress())
}
