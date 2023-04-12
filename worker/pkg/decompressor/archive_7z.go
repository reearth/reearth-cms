package decompressor

import (
	"io"
	"strings"

	"github.com/bodgit/sevenzip"
	"github.com/samber/lo"
)

type sevenZipFile struct {
	f *sevenzip.File
}

func (f sevenZipFile) name() string {
	return f.f.Name
}

func (f sevenZipFile) open() (io.ReadCloser, error) {
	return f.f.Open()
}

func (f sevenZipFile) skip() bool {
	fn := f.name()
	return strings.HasPrefix(fn, "/") || strings.HasSuffix(fn, "/")
}

type sevenZipArchive struct {
	sr *sevenzip.Reader
}

func new7ZipReader(r io.ReaderAt, size int64) (archive, error) {
	reader, err := sevenzip.NewReader(r, size)
	if err != nil {
		return nil, err
	}
	return sevenZipArchive{
		sr: reader,
	}, nil
}

func (a sevenZipArchive) files() []file {
	return lo.Map(a.sr.File, func(f *sevenzip.File, _ int) file {
		return sevenZipFile{f: f}
	})
}
