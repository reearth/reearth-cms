package decompressor

import (
	"archive/zip"
	"bytes"
	"context"
	"io"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestValidateEntryName(t *testing.T) {
	valid := []string{
		"a.txt",
		"dir/a.txt",
		"dir/sub/a.txt",
		"dir/",
		"./a.txt",
		"./",
		"a..b.txt",
		"..a/b",
		"dir/..hidden",
		"日本語/ファイル.txt",
		"ab:c.txt",
		`dir\a.txt`,
		`dir\sub\`,
		// absolute paths are made relative (like unzip / 7-Zip)
		"/etc/passwd",
		"/abs/dir/",
		`\abs\a.txt`,
		"C:/Windows/a.txt",
		`C:\Windows\a.txt`,
		"c:a.txt",
	}
	for _, n := range valid {
		assert.NoError(t, ValidateEntryName(n), n)
	}

	invalid := []string{
		"",
		"/",
		"..",
		"../",
		"../a.txt",
		"../../../XY/ZZZZ/logo.png",
		"dir/../../a.txt",
		"dir/../a.txt", // stays inside, but no legitimate archive needs ".."
		"data/../../../../top.txt",
		`..\..\a.txt`,
		`dir\..\..\a.txt`,
		"a\x00.txt",
		"C:/../a.txt",
		"/../../a.txt",
		".",
	}
	for _, n := range invalid {
		assert.ErrorIs(t, ValidateEntryName(n), ErrUnsafeEntryName, "%q", n)
	}
}

func buildZip(t *testing.T, names ...string) []byte {
	t.Helper()
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	for _, n := range names {
		w, err := zw.CreateHeader(&zip.FileHeader{Name: n, Method: zip.Deflate})
		require.NoError(t, err)
		if n[len(n)-1] != '/' {
			_, err = w.Write([]byte("content of " + n))
			require.NoError(t, err)
		}
	}
	require.NoError(t, zw.Close())
	return buf.Bytes()
}

func decompressAll(t *testing.T, data []byte, ext string) (map[string]string, error) {
	t.Helper()
	written := map[string]*Buffer{}
	uz, err := New(bytes.NewReader(data), int64(len(data)), ext, func(name string) (io.WriteCloser, error) {
		b := &Buffer{}
		written[name] = b
		return b, nil
	})
	require.NoError(t, err)
	err = uz.Decompress(context.Background(), 0, func(context.Context, int64) error { return nil })
	out := map[string]string{}
	for k, v := range written {
		out[k] = v.String()
	}
	return out, err
}

func TestDecompress_RejectsMaliciousZip(t *testing.T) {
	for _, evil := range []string{
		"../../../XY/ZZZZ/evil.txt",
		"data/../../../../evil.txt",
		"/../../evil.txt",
		`..\..\evil.txt`,
		`C:\..\evil.txt`,
	} {
		t.Run(evil, func(t *testing.T) {
			// the safe entry comes first: nothing at all may be written
			data := buildZip(t, "ok.txt", evil, "after.txt")
			written, err := decompressAll(t, data, "zip")
			assert.ErrorIs(t, err, ErrUnsafeEntryName)
			assert.Empty(t, written, "no entry may be written when the archive is rejected")
		})
	}
}

func TestDecompress_RejectsMalicious7z(t *testing.T) {
	// Fixtures were made with py7zr's internal _writestr, which skips its
	// own path check: each has "test1.txt" followed by one unsafe entry.
	for _, fixture := range []string{
		"testdata/malicious_traversal.7z", // ../../../XY/ZZZZ/evil.txt
		"testdata/malicious_backslash.7z", // ..\..\evil.txt
	} {
		t.Run(fixture, func(t *testing.T) {
			data, err := os.ReadFile(fixture)
			require.NoError(t, err)
			written, err := decompressAll(t, data, "7z")
			assert.ErrorIs(t, err, ErrUnsafeEntryName)
			assert.Empty(t, written, "no entry may be written when the archive is rejected")
		})
	}
}

func TestDecompress_AbsolutePathsExtractInside(t *testing.T) {
	t.Run("zip", func(t *testing.T) {
		data := buildZip(t, "ok.txt", "/etc/a.txt", `C:\Users\b.txt`, "//c.txt", "/")
		written, err := decompressAll(t, data, "zip")
		require.NoError(t, err)
		assert.Equal(t, map[string]string{
			"ok.txt":      "content of ok.txt",
			"etc/a.txt":   "content of /etc/a.txt",
			"Users/b.txt": `content of C:\Users\b.txt`,
			"c.txt":       "content of //c.txt",
		}, written)
	})

	t.Run("7z", func(t *testing.T) {
		// test1.txt followed by /etc/evil.txt
		data, err := os.ReadFile("testdata/absolute_path.7z")
		require.NoError(t, err)
		written, err := decompressAll(t, data, "7z")
		require.NoError(t, err)
		assert.Equal(t, map[string]string{
			"test1.txt":    "hello1",
			"etc/evil.txt": "evil",
		}, written)
	})
}

func TestDecompress_NestedZipUnchanged(t *testing.T) {
	names := []string{"root.txt", "dir/", "dir/a.txt", "dir/sub/", "dir/sub/b.txt", "./dot.txt", "a..b.txt", `win\`, `win\c.txt`}
	written, err := decompressAll(t, buildZip(t, names...), "zip")
	require.NoError(t, err)
	assert.Equal(t, map[string]string{
		"root.txt":      "content of root.txt",
		"dir/a.txt":     "content of dir/a.txt",
		"dir/sub/b.txt": "content of dir/sub/b.txt",
		"./dot.txt":     "content of ./dot.txt",
		"a..b.txt":      "content of a..b.txt",
		// backslash separators (older PowerShell) become directories
		"win/c.txt": `content of win\c.txt`,
	}, written)
}
