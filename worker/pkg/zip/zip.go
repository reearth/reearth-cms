package zip

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"
)

const limit = 1024 * 1024 * 1024 * 10 // 10GB

type Unzipper struct {
	r   *zip.Reader
	wFn func(name string) (io.WriteCloser, error)
}

func NewUnzipper(r *zip.Reader, wFn func(name string) (io.WriteCloser, error)) (*Unzipper, error) {
	return &Unzipper{
		r,
		wFn,
	}, nil
}

func (uz *Unzipper) Unzip() error {
	for _, f := range uz.r.File {

		if f.FileInfo().IsDir() {
			continue
		} else {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			defer rc.Close()

			w, err := uz.wFn(f.FileInfo().Name())
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
