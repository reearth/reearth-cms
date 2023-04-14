package decompressor

import (
	"archive/zip"
	"io"
	"strings"

	"github.com/samber/lo"
)

type zipFile struct {
	f *zip.File
}

func (f zipFile) name() string {
	return f.f.Name
}

func (f zipFile) open() (io.ReadCloser, error) {
	return f.f.Open()
}

func (f zipFile) skip() bool {
	fn := f.name()
	return strings.HasPrefix(fn, "/") || strings.HasSuffix(fn, "/") // || f.f.NonUTF8
}

func (f zipFile) size() uint64 {
	return f.f.UncompressedSize64
}

type zipArchive struct {
	zr *zip.Reader
}

func newZipReader(r io.ReaderAt, size int64) (archive, error) {
	reader, err := zip.NewReader(r, size)
	if err != nil {
		return nil, err
	}
	return zipArchive{
		zr: reader,
	}, nil
}

func (a zipArchive) files() []file {
	return lo.Map(a.zr.File, func(f *zip.File, _ int) file {
		return zipFile{f: f}
	})
}
