package interactor

import (
	"archive/zip"
	"bytes"
	"context"
	"testing"

	wfs "github.com/reearth/reearth-cms/worker/internal/infrastructure/fs"
	"github.com/reearth/reearth-cms/worker/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/worker/pkg/asset"
	"github.com/reearth/reearth-cms/worker/pkg/decompressor"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func Test_assetEntryPath(t *testing.T) {
	const base = "ab/cdef/data" // archive stored at ab/cdef/data.zip

	ok := map[string]string{
		"a.txt":        "ab/cdef/data/a.txt",
		"dir/a.txt":    "ab/cdef/data/dir/a.txt",
		"data/a.txt":   "ab/cdef/data/a.txt", // smartJoinPath de-duplicates the archive name
		"./a.txt":      "ab/cdef/data/a.txt",
		"x/../a.txt":   "ab/cdef/data/a.txt",
		"data/x/a.txt": "ab/cdef/data/x/a.txt",
	}
	for name, want := range ok {
		got, err := assetEntryPath(base, name)
		assert.NoError(t, err, name)
		assert.Equal(t, want, got, name)
	}

	for _, name := range []string{
		"../../../XY/ZZZZ/logo.png", // another asset
		"data/../../../../top.txt",  // bucket root
		"../../../../../../etc/x",
		"../../other/a.txt",
	} {
		_, err := assetEntryPath(base, name)
		assert.ErrorIs(t, err, decompressor.ErrUnsafeEntryName, name)
	}

	// archive at the root of the storage (as in the tests)
	got, err := assetEntryPath("test", "test1.txt")
	assert.NoError(t, err)
	assert.Equal(t, "test/test1.txt", got)
	_, err = assetEntryPath("test", "../../x")
	assert.ErrorIs(t, err, decompressor.ErrUnsafeEntryName)
}

type statusCMS struct {
	statuses []asset.ArchiveExtractionStatus
}

func (c *statusCMS) NotifyAssetDecompressed(_ context.Context, _ string, s *asset.ArchiveExtractionStatus) error {
	c.statuses = append(c.statuses, *s)
	return nil
}

func TestUsecase_Decompress_RejectsPathTraversal(t *testing.T) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	for _, n := range []string{"ok.txt", "../../../XY/ZZZZ/logo.png"} {
		w, err := zw.Create(n)
		require.NoError(t, err)
		_, _ = w.Write([]byte("x"))
	}
	require.NoError(t, zw.Close())

	fs := afero.NewMemMapFs()
	require.NoError(t, afero.WriteFile(fs, "ab/cdef/data.zip", buf.Bytes(), 0o644))
	fileGateway, err := wfs.NewFile(fs, "")
	require.NoError(t, err)
	cms := &statusCMS{}
	uc := NewUsecase(gateway.NewGateway(fileGateway, cms), nil)

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "ab/cdef/data.zip"))
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusFailed}, cms.statuses)

	// validation happens before writing: not even the safe entry is extracted
	for _, p := range []string{"ab/cdef/data/ok.txt", "XY/ZZZZ/logo.png", "logo.png"} {
		exists, err := afero.Exists(fs, p)
		require.NoError(t, err)
		assert.False(t, exists, p)
	}
}

func TestUsecase_Decompress_NormalArchiveUnchanged(t *testing.T) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	for _, n := range []string{"data/a.txt", "dir/b.txt"} {
		w, err := zw.Create(n)
		require.NoError(t, err)
		_, _ = w.Write([]byte(n))
	}
	require.NoError(t, zw.Close())

	fs := afero.NewMemMapFs()
	require.NoError(t, afero.WriteFile(fs, "ab/cdef/data.zip", buf.Bytes(), 0o644))
	fileGateway, err := wfs.NewFile(fs, "")
	require.NoError(t, err)
	cms := &statusCMS{}
	uc := NewUsecase(gateway.NewGateway(fileGateway, cms), nil)

	require.NoError(t, uc.Decompress(context.Background(), "aaa", "ab/cdef/data.zip"))
	assert.Equal(t, []asset.ArchiveExtractionStatus{asset.ArchiveExtractionStatusDone}, cms.statuses)

	for p, want := range map[string]string{
		"ab/cdef/data/a.txt":     "data/a.txt",
		"ab/cdef/data/dir/b.txt": "dir/b.txt",
	} {
		got, err := afero.ReadFile(fs, p)
		require.NoError(t, err, p)
		assert.Equal(t, want, string(got))
	}
}
