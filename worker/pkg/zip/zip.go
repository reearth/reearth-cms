package zip

import (
	"archive/zip"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
)

func Unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		rc, err := f.Open()
		if err != nil {
			return err
		}
		defer rc.Close()

		if f.FileInfo().IsDir() {
			path := filepath.Join(dest, f.Name)
			_ = os.MkdirAll(path, f.Mode())
		} else {
			buf := make([]byte, f.UncompressedSize)
			_, err = io.ReadFull(rc, buf)
			if err != nil {
				return err
			}

			path := filepath.Join(dest, f.Name)
			if err = ioutil.WriteFile(path, buf, f.Mode()); err != nil {
				return err
			}
		}
	}
	return nil
}

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
			// path := filepath.Join(dest, f.Name)
			// _ = os.MkdirAll(path, f.Mode())
			//MEMO:ディレクトリの場合はGCSにおいて意味を成さないのでcontinue
			continue
		} else {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			defer rc.Close()

			fileName := filepath.Join(filepath.Dir(f.FileInfo().Name()))
			w := uz.wFn(fileName)
			_, err = io.Copy(w, rc)
			if err != nil {
				return err
			}

		}
	}
	return nil
}

func Unzip2(ra io.ReaderAt, size int64, wFn func(name string) io.Writer) error {
	r, err := zip.NewReader(ra, size)

	if err != nil {
		return err
	}

	for _, f := range r.File {

		if f.FileInfo().IsDir() {
			// path := filepath.Join(dest, f.Name)
			// _ = os.MkdirAll(path, f.Mode())
			//MEMO:ディレクトリの場合はGCSにおいて意味を成さないのでcontinue
			continue
		} else {
			rc, err := f.Open()
			if err != nil {
				return err
			}
			defer rc.Close()

			fileName := filepath.Join(filepath.Dir(f.FileInfo().Name()))
			w := wFn(fileName)
			_, err = io.Copy(w, rc)
			if err != nil {
				return err
			}

		}
	}
	return nil
}
