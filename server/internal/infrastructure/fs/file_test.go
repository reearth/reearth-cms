package fs

import (
	"context"
	"io"
	"os"
	"path"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestNewFile(t *testing.T) {
	f, err := NewFile(mockFs(), "")
	assert.NoError(t, err)
	assert.NotNil(t, f)

	f1, err := NewFile(mockFs(), "htp:#$%&''()00lde/fdaslk")
	assert.Equal(t, err, invalidBaseURLErr)
	assert.Nil(t, f1)
}

func TestFile_ReadAsset(t *testing.T) {
	f, _ := NewFile(mockFs(), "")

	r, err := f.ReadAsset(context.Background(), "xxx.txt")
	assert.NoError(t, err)
	c, err := io.ReadAll(r)
	assert.NoError(t, err)
	assert.Equal(t, "hello", string(c))
	assert.NoError(t, r.Close())

	r, err = f.ReadAsset(context.Background(), "")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadAsset(context.Background(), "aaa.txt")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)

	r, err = f.ReadAsset(context.Background(), "../published/s.json")
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
}

func TestFile_UploadAsset(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "https://example.com/assets")

	u, err := f.UploadAsset(context.Background(), &file.File{
		Path:    "aaa.txt",
		Content: io.NopCloser(strings.NewReader("aaa")),
	})
	p := getFSObjectPath(u, "aaa.txt")

	assert.NoError(t, err)
	assert.Contains(t, p, "aaa.txt")

	u1, err1 := f.UploadAsset(context.Background(), nil)
	assert.Equal(t, "", u1)
	assert.Same(t, gateway.ErrInvalidFile, err1)

	u2, err2 := f.UploadAsset(context.Background(), &file.File{
		Size: fileSizeLimit + 1,
	})
	assert.Equal(t, "", u2)
	assert.Same(t, gateway.ErrFileTooLarge, err2)

	u3, err3 := f.UploadAsset(context.Background(), &file.File{
		Content: nil,
	})
	assert.Equal(t, "", u3)
	assert.Error(t, err3)

	uf, _ := fs.Open(p)
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "aaa", string(c))
}

func TestFile_DeleteAsset(t *testing.T) {
	u := newUUID()
	n := "aaa.txt"
	fs := mockFs()
	f, _ := NewFile(fs, "https://example.com/assets")
	err := f.DeleteAsset(context.Background(), u, n)
	assert.NoError(t, err)

	_, err = fs.Stat(getFSObjectPath(u, n))
	assert.ErrorIs(t, err, os.ErrNotExist)

	u1 := ""
	n1 := ""
	fs1 := mockFs()
	f1, _ := NewFile(fs1, "https://example.com/assets")
	err1 := f1.DeleteAsset(context.Background(), u1, n1)
	assert.Same(t, gateway.ErrInvalidFile, err1)
}

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, path.Join(assetDir, u[:2], u[2:], "xxx.yyy"), getFSObjectPath(u, n))

	u1 := ""
	n1 := ""
	assert.Equal(t, "", getFSObjectPath(u1, n1))
}

func TestFile_IsValidUUID(t *testing.T) {
	u := newUUID()
	assert.Equal(t, true, IsValidUUID(u))

	u1 := "xxxxxx"
	assert.Equal(t, false, IsValidUUID(u1))
}

func mockFs() afero.Fs {
	files := map[string]string{
		"assets/xxx.txt":           "hello",
		"plugins/aaa~1.0.0/foo.js": "bar",
		"published/s.json":         "{}",
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}
