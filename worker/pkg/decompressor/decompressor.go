package decompressor

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
)

var (
	ErrUnsupportedExtention = errors.New("unsupoprted extention type")
)

const limit = 1024 * 1024 * 1024 * 30 // 30GB

type decompressor struct {
	r   *zip.Reader
	wFn func(name string) (io.WriteCloser, error)
}

func New(r io.ReaderAt, size int64, ext string, wFn func(name string) (io.WriteCloser, error)) (*decompressor, error) {
	if ext == "zip" {
		zr, err := zip.NewReader(r, size)
		if err != nil {
			return nil, err
		}
		return &decompressor{
			r:   zr,
			wFn: wFn,
		}, nil
	}
	return nil, ErrUnsupportedExtention
}

func (uz *decompressor) Decompress() error {
	for _, f := range uz.r.File {

		if f.FileInfo().IsDir() {
			continue
		} else {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			defer rc.Close()

			w, err := uz.wFn(f.Name)
			if err != nil {
				return err
			}
			_, err = io.CopyN(w, rc, limit)
			_ = w.Close()
			if errors.Is(io.EOF, err) {
				continue
			}
			if err != nil {
				return &LimitError{Path: f.FileInfo().Name()}
			}

		}
	}
	return nil
}

type LimitError struct {
	Path string
}

func (e *LimitError) Error() string {
	return fmt.Sprintf("file size limit reached at %s", e.Path)
}
