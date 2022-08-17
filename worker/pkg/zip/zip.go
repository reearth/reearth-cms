package zip

import (
	"archive/zip"
	"io"
)

type Unzipper struct {
	r   *zip.Reader
	wFn func(name string) io.Writer
}

func NewUnzipper(ra io.ReaderAt, size int64, wFn func(name string) io.Writer) (*Unzipper, error) {
	r, err := zip.NewReader(ra, size)
	if err != nil {
		return nil, err
	}
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

			w := uz.wFn(f.FileInfo().Name())
			_, err = io.Copy(w, rc)
			if err != nil {
				return err
			}

		}
	}
	return nil
}
