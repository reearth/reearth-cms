package fs

import (
	"context"
	"io"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/pkg/file"
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

func TestFile_UploadAsset(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "https://example.com/assets")

	u, err := f.UploadAsset(context.Background(), &file.File{
		Path:    "aaa.txt",
		Content: io.NopCloser(strings.NewReader("aaa")),
	})
	assert.NoError(t, err)
	assert.Contains(t, u, "aaa.txt")

	uf, _ := fs.Open(u)
	c, _ := io.ReadAll(uf)
	assert.Equal(t, "aaa", string(c))
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
