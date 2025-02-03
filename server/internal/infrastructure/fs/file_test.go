package fs

import (
	"context"
	"io"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"
	"testing"

	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/asset"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearthx/account/accountdomain"
	"github.com/reearth/reearthx/rerror"
	"github.com/spf13/afero"
	"github.com/stretchr/testify/assert"
)

func TestNewFile(t *testing.T) {
	f, err := NewFile(mockFs(), "")
	assert.NoError(t, err)
	assert.NotNil(t, f)

	f1, err := NewFile(mockFs(), "htp:#$%&''()00lde/fdaslk")
	assert.Equal(t, err, ErrInvalidBaseURL)
	assert.Nil(t, f1)
}

func TestFile_ReadAsset(t *testing.T) {
	f, _ := NewFile(mockFs(), "")
	u := "5130c89f-8f67-4766-b127-49ee6796d464"

	r, h, err := f.ReadAsset(context.Background(), u, "xxx.txt", nil)
	assert.NoError(t, err)
	c, err := io.ReadAll(r)
	assert.NoError(t, err)
	assert.Equal(t, "hello", string(c))
	assert.Equal(t, map[string]string{
		"Content-Type":   "application/octet-stream",
		"Content-Length": "5",
		"Last-Modified":  h["Last-Modified"],
	}, h)
	assert.NoError(t, r.Close())

	r, h, err = f.ReadAsset(context.Background(), u, "", nil)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
	assert.Nil(t, h)

	r, h, err = f.ReadAsset(context.Background(), u, "aaa.txt", nil)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
	assert.Nil(t, h)

	r, h, err = f.ReadAsset(context.Background(), u, "../published/s.json", nil)
	assert.ErrorIs(t, err, rerror.ErrNotFound)
	assert.Nil(t, r)
	assert.Nil(t, h)
}

func TestFile_GetAssetFiles(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "")

	files, err := f.GetAssetFiles(context.Background(), "5130c89f-8f67-4766-b127-49ee6796d464")
	assert.NoError(t, err)
	assert.Equal(t, []gateway.FileEntry{
		{Name: "xxx.txt", Size: 5},
		{Name: path.Join("yyy", "hello.txt"), Size: 6},
	}, files)
}

func TestFile_UploadAsset(t *testing.T) {
	fs := mockFs()
	f, _ := NewFile(fs, "https://example.com/assets")

	u, _, err := f.UploadAsset(context.Background(), &file.File{
		Name:    "aaa.txt",
		Content: io.NopCloser(strings.NewReader("aaa")),
	})
	p := getFSObjectPath(u, "aaa.txt")

	assert.NoError(t, err)
	assert.Contains(t, p, "aaa.txt")

	u1, _, err1 := f.UploadAsset(context.Background(), nil)
	assert.Equal(t, "", u1)
	assert.Same(t, gateway.ErrInvalidFile, err1)

	u2, _, err2 := f.UploadAsset(context.Background(), &file.File{
		Size: fileSizeLimit + 1,
	})
	assert.Equal(t, "", u2)
	assert.Same(t, gateway.ErrFileTooLarge, err2)

	u3, _, err3 := f.UploadAsset(context.Background(), &file.File{
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

func TestFile_DeleteAssetsInBatch(t *testing.T) {
	type args struct {
		ids map[string]string
	}
	tests := []struct {
		name string
		args args
		want error
	}{
		{
			name: "success",
			args: args{
				ids: map[string]string{newUUID(): "aaa.txt", newUUID(): "yyy/hello.txt"},
			},
			want: nil,
		},
		{
			name: "empty",
			args: args{
				ids: map[string]string{},
			},
			want: rerror.ErrNotFound,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			fs := mockFs()
			f, _ := NewFile(fs, "aaa.txt")
			err := f.DeleteAssetsInBatch(context.Background(), tt.args.ids)
			assert.Equal(t, tt.want, err)
		})
	}
}

func TestFile_GetURL(t *testing.T) {
	host := "https://example.com"
	fs := mockFs()
	r, err := NewFile(fs, host)
	assert.NoError(t, err)

	u := newUUID()
	n := "xxx.yyy"
	a := asset.New().NewID().
		Project(id.NewProjectID()).
		CreatedByUser(accountdomain.NewUserID()).
		Size(1000).FileName(n).
		UUID(u).
		Thread(id.NewThreadID().Ref()).
		MustBuild()

	expected, err := url.JoinPath(host, assetDir, u[:2], u[2:], url.PathEscape(n))
	assert.NoError(t, err)
	actual := r.GetURL(a)
	assert.Equal(t, expected, actual)
}

func TestFile_GetFSObjectPath(t *testing.T) {
	u := newUUID()
	n := "xxx.yyy"
	assert.Equal(t, filepath.Join(assetDir, u[:2], u[2:], "xxx.yyy"), getFSObjectPath(u, n))

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
		filepath.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "xxx.txt"):          "hello",
		filepath.Join("assets", "51", "30c89f-8f67-4766-b127-49ee6796d464", "yyy", "hello.txt"): "hello!",
		filepath.Join("plugins", "aaa~1.0.0", "foo.js"):                                         "bar",
		filepath.Join("published", "s.json"):                                                    "{}",
	}

	fs := afero.NewMemMapFs()
	for name, content := range files {
		f, _ := fs.Create(name)
		_, _ = f.WriteString(content)
		_ = f.Close()
	}
	return fs
}
