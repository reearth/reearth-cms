package usecase

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
