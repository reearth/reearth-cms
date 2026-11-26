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

func (f zipFile) Name() string {
	return NormalizeEntryName(f.f.Name)
}

func (f zipFile) Open() (io.ReadCloser, error) {
	return f.f.Open()
}

func (f zipFile) Skip() bool {
	// Directory entries are not written. Unsafe names (including absolute
	// paths) are rejected by ValidateEntryName before extraction.
	return strings.HasSuffix(f.Name(), "/") // || f.f.NonUTF8
}

func (f zipFile) Size() uint64 {
	return f.f.UncompressedSize64
}

type zipArchive struct {
	zr *zip.Reader
}

func newZipReader(r io.ReaderAt, size int64) (Archive, error) {
	reader, err := zip.NewReader(r, size)
	if err != nil {
		return nil, err
	}
	return zipArchive{
		zr: reader,
	}, nil
}

func (a zipArchive) Files() []File {
	return lo.Map(a.zr.File, func(f *zip.File, _ int) File {
		return zipFile{f: f}
	})
}
