package fs

import (
	"context"
	"io"
	"net/url"
	"os"
	"path"
	"path/filepath"

	"github.com/kennygrant/sanitize"
	"github.com/reearth/reearth-cms/server/internal/usecase/gateway"
	"github.com/reearth/reearth-cms/server/pkg/file"
	"github.com/reearth/reearth-cms/server/pkg/id"
	"github.com/reearth/reearth-cms/server/pkg/rerror"
	"github.com/spf13/afero"
)

type fileRepo struct {
	fs      afero.Fs
	urlBase *url.URL
}

func NewFile(fs afero.Fs, urlBase string) (gateway.File, error) {
	var b *url.URL
	var err error
	b, err = url.Parse(urlBase)
	if err != nil {
		return nil, invalidBaseURLErr
	}

	return &fileRepo{
		fs:      fs,
		urlBase: b,
	}, nil
}

func (f *fileRepo) ReadAsset(ctx context.Context, filename string) (io.ReadCloser, error) {
	return f.read(ctx, filepath.Join(assetDir, sanitize.Path(filename)))
}

func (f *fileRepo) UploadAsset(ctx context.Context, file *file.File) (*url.URL, error) {
	filename := sanitize.Path(newAssetID() + path.Ext(file.Path))
	if err := f.upload(ctx, filepath.Join(assetDir, filename), file.Content); err != nil {
		return nil, err
	}
	return getAssetFileURL(f.urlBase, filename), nil
}

func (f *fileRepo) DeleteAsset(ctx context.Context, u *url.URL) error {
	if u == nil {
		return nil
	}
	p := sanitize.Path(u.Path)
	if p == "" || f.urlBase == nil || u.Scheme != f.urlBase.Scheme || u.Host != f.urlBase.Host || path.Dir(p) != f.urlBase.Path {
		return gateway.ErrInvalidFile
	}
	return f.delete(ctx, filepath.Join(assetDir, path.Base(p)))
}

// helpers

func (f *fileRepo) read(ctx context.Context, filename string) (io.ReadCloser, error) {
	if filename == "" {
		return nil, rerror.ErrNotFound
	}

	file, err := f.fs.Open(filename)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, rerror.ErrNotFound
		}
		return nil, rerror.ErrInternalBy(err)
	}
	return file, nil
}

func (f *fileRepo) upload(ctx context.Context, filename string, content io.Reader) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if fnd := path.Dir(filename); fnd != "" {
		if err := f.fs.MkdirAll(fnd, 0755); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	dest, err := f.fs.Create(filename)
	if err != nil {
		return rerror.ErrInternalBy(err)
	}
	defer func() {
		_ = dest.Close()
	}()

	if _, err := io.Copy(dest, content); err != nil {
		return gateway.ErrFailedToUploadFile
	}

	return nil
}

func (f *fileRepo) move(ctx context.Context, from, dest string) error {
	if from == "" || dest == "" || from == dest {
		return gateway.ErrInvalidFile
	}

	if destd := path.Dir(dest); destd != "" {
		if err := f.fs.MkdirAll(destd, 0755); err != nil {
			return rerror.ErrInternalBy(err)
		}
	}

	if err := f.fs.Rename(from, dest); err != nil {
		if os.IsNotExist(err) {
			return rerror.ErrNotFound
		}
		return rerror.ErrInternalBy(err)
	}

	return nil
}

func (f *fileRepo) delete(ctx context.Context, filename string) error {
	if filename == "" {
		return gateway.ErrFailedToUploadFile
	}

	if err := f.fs.RemoveAll(filename); err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return rerror.ErrInternalBy(err)
	}
	return nil
}

func getAssetFileURL(base *url.URL, filename string) *url.URL {
	if base == nil {
		return nil
	}

	// https://github.com/golang/go/issues/38351
	b := *base
	b.Path = path.Join(b.Path, filename)
	return &b
}

func newAssetID() string {
	// TODO: replace
	return id.NewAssetID().String()
}
