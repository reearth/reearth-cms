package decompressor

import (
	"archive/zip"
	"errors"
	"fmt"
	"io"

	"github.com/bodgit/sevenzip"
)

var (
	ErrUnsupportedExtention = errors.New("unsupoprted extention type")
)

const limit = 1024 * 1024 * 1024 * 30 // 30GB

type decompressor struct {
	zr  *zip.Reader
	sr  *sevenzip.Reader
	wFn func(name string) (io.WriteCloser, error)
}

func New(r io.ReaderAt, size int64, ext string, wFn func(name string) (io.WriteCloser, error)) (*decompressor, error) {
	if ext == "zip" {
		zr, err := zip.NewReader(r, size)
		if err != nil {
			return nil, err
		}
		return &decompressor{
			zr:  zr,
			wFn: wFn,
		}, nil
	} else if ext == "7z" {
		sr, err := sevenzip.NewReader(r, size)
		if err != nil {
			return nil, err
		}
		return &decompressor{
			sr:  sr,
			wFn: wFn,
		}, nil
	}
	return nil, ErrUnsupportedExtention
}

func (uz *decompressor) Decompress() error {
	if uz.zr != nil {
		for _, f := range uz.zr.File {
			if f.FileInfo().IsDir() {
				continue
			} else {
				rc, err := f.Open()
				if err != nil {
					return err
				}
				defer rc.Close()
				err = uz.read(f.Name, rc)
				if err != nil {
					return err
				}
			}
		}
	} else if uz.sr != nil {
		for _, f := range uz.sr.File {
			if f.FileInfo().IsDir() {
				continue
			} else {
				rc, err := f.Open()
				if err != nil {
					return err
				}
				defer rc.Close()
				err = uz.read(f.Name, rc)
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}

func (uz *decompressor) read(name string, r io.Reader) error {
	w, err := uz.wFn(name)
	if err != nil {
		return err
	}
	_, err = io.CopyN(w, r, limit)
	_ = w.Close()
	if !errors.Is(err, io.EOF) && err != nil {
		for _, f := range uz.sr.File {
			return &LimitError{Path: f.FileInfo().Name()}
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
